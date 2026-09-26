// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";

import {BaseScript} from "./base/BaseScript.sol";

contract SwapScript is BaseScript {
    function run() external {
        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 3000,
            tickSpacing: 60,
            hooks: hookContract
        });
        bytes memory hookData = new bytes(0);

        vm.startBroadcast();

        // Approve tokens for swap router
        token1.approve(address(swapRouter), type(uint256).max);
        token0.approve(address(swapRouter), type(uint256).max);

        // Execute swap
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
