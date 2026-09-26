// sol! macro generates functions matching the Solidity ABI — argument counts are dictated by the contract interface
#![allow(clippy::too_many_arguments)]

use alloy::hex;
use alloy::network::EthereumWallet;
use alloy::primitives::{Address, Bytes, Signed, Uint, U256};
use alloy::providers::ProviderBuilder;
use alloy::signers::local::PrivateKeySigner;
use alloy::sol;
use alloy::sol_types::SolValue;
use anyhow::Result;

// Contract addresses (Sepolia)
pub const TKNA: Address = Address::new(hex!("7546360e0011Bb0B52ce10E21eF0E9341453fE71"));
pub const TKNB: Address = Address::new(hex!("F6d91478e66CE8161e15Da103003F3BA6d2bab80"));
pub const SWAP_ROUTER: Address = Address::new(hex!("f13D190e9117920c703d79B5F33732e10049b115"));
pub const HOOK: Address = Address::new(hex!("5D4505AA950a73379B8E9f1116976783Ba8340C0"));

// V2 hook (dynamic fees + hookData agent tracking)
pub const HOOK_V2: Address = Address::new(hex!("A8760B755c67c5C75A8A60ED7E3713eA2448D0C0"));

/// Dynamic fee flag used by Uniswap V4 for pools with hook-controlled fees
pub const DYNAMIC_FEE_FLAG: u32 = 0x800000;

sol! {
    #[sol(rpc)]
    interface IERC20 {
        function approve(address spender, uint256 amount) external returns (bool);
        function balanceOf(address account) external view returns (uint256);
    }
}

sol! {
    struct PoolKey {
        address currency0;
        address currency1;
        uint24 fee;
        int24 tickSpacing;
        address hooks;
    }

    #[sol(rpc)]
    interface ISwapRouter {
        function swapExactTokensForTokens(
            uint256 amountIn,
            uint256 amountOutMin,
            bool zeroForOne,
            PoolKey calldata poolKey,
            bytes calldata hookData,
            address receiver,
            uint256 deadline
        ) external returns (uint256 amountOut);
    }

    #[sol(rpc)]
    interface IAgentCounter {
        function getAgentSwapCount(PoolKey calldata key, address agent) external view returns (uint256);
        function getPoolSwapCount(PoolKey calldata key) external view returns (uint256);
    }

    /// V2 hook ABI — adds getAgentFee() for previewing the fee tier an agent qualifies for
    #[sol(rpc)]
    interface IAgentCounterV2 {
        function getAgentSwapCount(PoolKey calldata key, address agent) external view returns (uint256);
        function getPoolSwapCount(PoolKey calldata key) external view returns (uint256);
        function getAgentFee(PoolKey calldata key, address agent) external view returns (uint24);
    }
}

pub struct SwapClient {
    rpc_url: String,
    private_key: String,
}

impl SwapClient {
    pub fn new(rpc_url: String, private_key: String) -> Self {
        Self {
            rpc_url,
            private_key,
        }
    }

    pub(crate) fn pool_key() -> PoolKey {
        PoolKey {
            currency0: TKNA,
            currency1: TKNB,
            fee: Uint::<24, 1>::from(3000u16),
            tickSpacing: Signed::<24, 1>::try_from(60).unwrap(),
            hooks: HOOK,
        }
    }

    /// Execute a V1 swap with slippage protection.
    ///
    /// `amount_out_min` is enforced on-chain — the router reverts if actual output falls below
    /// this value. Returns `(tx_hash, actual_out)` where `actual_out` is measured via
    /// token balance diff, enabling post-execution MEV analysis.
    pub async fn execute_swap(
        &self,
        amount: U256,
        zero_for_one: bool,
        amount_out_min: U256,
    ) -> Result<(String, U256)> {
        let signer: PrivateKeySigner = self.private_key.parse()?;
        let receiver = signer.address();
        let wallet = EthereumWallet::from(signer);
        let provider = ProviderBuilder::new()
            .with_recommended_fillers()
            .wallet(wallet)
            .on_http(self.rpc_url.parse()?);

        // Approve token for swap router
        let token_addr = if zero_for_one { TKNA } else { TKNB };
        let token = IERC20::new(token_addr, &provider);
        let approve_call = token.approve(SWAP_ROUTER, U256::MAX);
        let approve_tx = approve_call.send().await?;
        let approve_receipt = approve_tx.get_receipt().await?;
        println!(
            "  Approved token: tx {:#x}\n  https://sepolia.etherscan.io/tx/{:#x}",
            approve_receipt.transaction_hash, approve_receipt.transaction_hash
        );

        // Snapshot output token balance before swap to measure actual output
        let token_out_addr = if zero_for_one { TKNB } else { TKNA };
        let token_out = IERC20::new(token_out_addr, &provider);
        let balance_before = token_out.balanceOf(receiver).call().await?._0;

        // Execute swap with on-chain slippage enforcement
        let router = ISwapRouter::new(SWAP_ROUTER, &provider);
        let deadline = U256::from(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)?
                .as_secs()
                + 3600,
        );

        let swap_call = router.swapExactTokensForTokens(
            amount,
            amount_out_min,
            zero_for_one,
            Self::pool_key(),
            vec![].into(),
            receiver,
            deadline,
        );
        let swap_tx = swap_call.send().await?;
        let receipt = swap_tx.get_receipt().await?;
        let tx_hash = format!("{:#x}", receipt.transaction_hash);
        println!("  Swap executed: tx {tx_hash}");

        // Measure actual output via balance diff
        let balance_after = token_out.balanceOf(receiver).call().await?._0;
        let actual_out = balance_after.saturating_sub(balance_before);

        Ok((tx_hash, actual_out))
    }

    /// V2 pool key: same tokens, but uses DYNAMIC_FEE_FLAG so the hook can override
    /// fees per-swap (e.g. rebates for frequent agents).
    pub(crate) fn pool_key_v2() -> PoolKey {
        PoolKey {
            currency0: TKNA,
            currency1: TKNB,
            fee: Uint::<24, 1>::from(DYNAMIC_FEE_FLAG),
            tickSpacing: Signed::<24, 1>::try_from(60).unwrap(),
            hooks: HOOK_V2,
        }
    }

    /// Execute a swap on the V2 pool with slippage protection.
    ///
    /// Unlike V1, this ABI-encodes the agent's EOA address into hookData so the
    /// AgentCounterV2 hook can track the real agent (not the router address).
    /// Returns `(tx_hash, actual_out)` for post-execution MEV analysis.
    pub async fn execute_swap_v2(
        &self,
        amount: U256,
        zero_for_one: bool,
        amount_out_min: U256,
    ) -> Result<(String, U256)> {
        let signer: PrivateKeySigner = self.private_key.parse()?;
        let receiver = signer.address();
        let wallet = EthereumWallet::from(signer);
        let provider = ProviderBuilder::new()
            .with_recommended_fillers()
            .wallet(wallet)
            .on_http(self.rpc_url.parse()?);

        // Approve token for swap router
        let token_addr = if zero_for_one { TKNA } else { TKNB };
        let token = IERC20::new(token_addr, &provider);
        let approve_call = token.approve(SWAP_ROUTER, U256::MAX);
        let approve_tx = approve_call.send().await?;
        let approve_receipt = approve_tx.get_receipt().await?;
        println!(
            "  Approved token: tx {:#x}\n  https://sepolia.etherscan.io/tx/{:#x}",
            approve_receipt.transaction_hash, approve_receipt.transaction_hash
        );

        // Snapshot output token balance before swap
        let token_out_addr = if zero_for_one { TKNB } else { TKNA };
        let token_out = IERC20::new(token_out_addr, &provider);
        let balance_before = token_out.balanceOf(receiver).call().await?._0;

        // Encode agent EOA as hookData for V2 agent tracking
        let hook_data: Bytes = receiver.abi_encode().into();

        let router = ISwapRouter::new(SWAP_ROUTER, &provider);
        let deadline = U256::from(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)?
                .as_secs()
                + 3600,
        );

        let swap_call = router.swapExactTokensForTokens(
            amount,
            amount_out_min,
            zero_for_one,
            Self::pool_key_v2(),
            hook_data,
            receiver,
            deadline,
        );
        let swap_tx = swap_call.send().await?;
        let receipt = swap_tx.get_receipt().await?;
        let tx_hash = format!("{:#x}", receipt.transaction_hash);
        println!("  Swap executed (V2): tx {tx_hash}");

        // Measure actual output via balance diff
        let balance_after = token_out.balanceOf(receiver).call().await?._0;
        let actual_out = balance_after.saturating_sub(balance_before);

        Ok((tx_hash, actual_out))
    }

    /// Query V2 hook for swap counts and the agent's current fee tier.
    /// Returns pool total, agent swaps, and fee percentage (0.30% base or 0.20% rebate).
    pub async fn get_swap_counts_v2(&self) -> Result<String> {
        let signer: PrivateKeySigner = self.private_key.parse()?;
        let agent_addr = signer.address();
        let wallet = EthereumWallet::from(signer);
        let provider = ProviderBuilder::new()
            .with_recommended_fillers()
            .wallet(wallet)
            .on_http(self.rpc_url.parse()?);

        let hook = IAgentCounterV2::new(HOOK_V2, &provider);
        let pool_key = Self::pool_key_v2();

        let pool_count = hook.getPoolSwapCount(pool_key.clone()).call().await?._0;

        let agent_count = hook
            .getAgentSwapCount(pool_key.clone(), agent_addr)
            .call()
            .await?
            ._0;

        let agent_fee = hook.getAgentFee(pool_key, agent_addr).call().await?._0;

        let fee_pct = f64::from(agent_fee) / 10000.0;
        Ok(format!(
            "[V2] Pool total: {} | Your swaps: {} | Your fee: {:.2}%",
            pool_count, agent_count, fee_pct
        ))
    }

    pub async fn get_swap_counts(&self) -> Result<String> {
        let signer: PrivateKeySigner = self.private_key.parse()?;
        let agent_addr = signer.address();
        let wallet = EthereumWallet::from(signer);
        let provider = ProviderBuilder::new()
            .with_recommended_fillers()
            .wallet(wallet)
            .on_http(self.rpc_url.parse()?);

        let hook = IAgentCounter::new(HOOK, &provider);
        let pool_key = Self::pool_key();

        let pool_count = hook.getPoolSwapCount(pool_key.clone()).call().await?._0;

        let agent_count = hook
            .getAgentSwapCount(pool_key, agent_addr)
            .call()
            .await?
            ._0;

        Ok(format!(
            "Pool total swaps: {} | Your agent swaps: {}",
            pool_count, agent_count
        ))
    }
}
