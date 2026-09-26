// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager, SwapParams} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";

/// @title AgentCounterV2 Hook
/// @notice Uniswap V4 hook that tracks swaps per agent (via hookData) and gives fee rebates to frequent agents
/// @dev Fixes V1's broken agent tracking (V1 tracked the router address, not the actual agent EOA)
contract AgentCounterV2 is BaseHook {
    using PoolIdLibrary for PoolKey;
    using LPFeeLibrary for uint24;

    /// @notice Base swap fee: 0.30%
    uint24 public constant BASE_FEE = 3000;

    /// @notice Rebated swap fee for frequent agents: 0.20%
    uint24 public constant REBATE_FEE = 2000;

    /// @notice Number of swaps required before an agent qualifies for the rebate
    uint256 public constant REBATE_THRESHOLD = 5;

    error NotDynamicFee();

    mapping(PoolId => uint256 count) public beforeSwapCount;
    mapping(PoolId => uint256 count) public afterSwapCount;

    /// @notice Swap count per pool per agent EOA (decoded from hookData)
    mapping(PoolId => mapping(address => uint256)) public agentSwapCount;

    /// @notice Emitted when an agent executes a swap
    event AgentSwap(PoolId indexed poolId, address indexed agent, uint256 agentTotal, uint256 poolTotal);

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    /// @notice Verify that the pool was initialized with a dynamic fee
    function _afterInitialize(address, PoolKey calldata key, uint160, int24)
        internal
        override
        returns (bytes4)
    {
        if (!key.fee.isDynamicFee()) revert NotDynamicFee();
        return BaseHook.afterInitialize.selector;
    }

    /// @notice Determine the fee for this swap based on the agent's swap history
    function _beforeSwap(address, PoolKey calldata key, SwapParams calldata, bytes calldata hookData)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        PoolId poolId = key.toId();
        beforeSwapCount[poolId]++;

        // Determine fee based on agent's history
        uint24 fee = BASE_FEE;
        if (hookData.length >= 32) {
            address agent = abi.decode(hookData, (address));
            if (agentSwapCount[poolId][agent] >= REBATE_THRESHOLD) {
                fee = REBATE_FEE;
            }
        }

        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, fee | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    /// @notice Track the agent's swap and emit event
    function _afterSwap(address sender, PoolKey calldata key, SwapParams calldata, BalanceDelta, bytes calldata hookData)
        internal
        override
        returns (bytes4, int128)
    {
        PoolId poolId = key.toId();
        afterSwapCount[poolId]++;

        // Decode agent EOA from hookData; fall back to sender (router) if not provided
        address agent = sender;
        if (hookData.length >= 32) {
            agent = abi.decode(hookData, (address));
        }

        agentSwapCount[poolId][agent]++;

        emit AgentSwap(poolId, agent, agentSwapCount[poolId][agent], afterSwapCount[poolId]);

        return (BaseHook.afterSwap.selector, 0);
    }

    /// @notice Get the swap count for a specific agent in a pool
    function getAgentSwapCount(PoolKey calldata key, address agent) external view returns (uint256) {
        return agentSwapCount[key.toId()][agent];
    }

    /// @notice Get the total swap count for a pool
    function getPoolSwapCount(PoolKey calldata key) external view returns (uint256) {
        return afterSwapCount[key.toId()];
    }

    /// @notice Preview the fee an agent would pay for a swap
    function getAgentFee(PoolKey calldata key, address agent) external view returns (uint24) {
        if (agentSwapCount[key.toId()][agent] >= REBATE_THRESHOLD) {
            return REBATE_FEE;
        }
        return BASE_FEE;
    }
}
