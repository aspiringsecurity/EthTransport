// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";

import {BaseScript} from "./base/BaseScript.sol";

/// @notice Execute a swap on the V2 pool with agent EOA in hookData
contract SwapV2Script is BaseScript {
    function run() external {
        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
            tickSpacing: 60,
            hooks: hookContractV2
        });

        // Encode the deployer's address as hookData so the hook tracks the correct agent
        bytes memory hookData = abi.encode(deployerAddress);

        vm.startBroadcast();

        token1.approve(address(swapRouter), type(uint256).max);
        token0.approve(address(swapRouter), type(uint256).max);

        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: hookData,
            receiver: deployerAddress,
            deadline: block.timestamp + 3600
        });

        vm.stopBroadcast();
    }
}
