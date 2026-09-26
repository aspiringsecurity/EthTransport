// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";

import {EasyPosm} from "./utils/libraries/EasyPosm.sol";

import {AgentCounter} from "../src/AgentCounter.sol";
import {BaseTest} from "./utils/BaseTest.sol";

contract AgentCounterTest is BaseTest {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    Currency currency0;
    Currency currency1;

    PoolKey poolKey;

    AgentCounter hook;
    PoolId poolId;

    uint256 tokenId;
    int24 tickLower;
    int24 tickUpper;

    function setUp() public {
        // Deploys all required artifacts.
        deployArtifactsAndLabel();

        (currency0, currency1) = deployCurrencyPair();

        // Deploy the hook to an address with the correct flags
        address flags = address(
            uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG) ^ (0x4444 << 144) // Namespace the hook to avoid collisions
        );
        bytes memory constructorArgs = abi.encode(poolManager);
        deployCodeTo("AgentCounter.sol:AgentCounter", constructorArgs, flags);
        hook = AgentCounter(flags);

        // Create the pool
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        // Provide full-range liquidity to the pool
        tickLower = TickMath.minUsableTick(poolKey.tickSpacing);
        tickUpper = TickMath.maxUsableTick(poolKey.tickSpacing);

        uint128 liquidityAmount = 100e18;

        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts.getAmountsForLiquidity(
            Constants.SQRT_PRICE_1_1,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            liquidityAmount
        );

        (tokenId,) = positionManager.mint(
            poolKey,
            tickLower,
            tickUpper,
            liquidityAmount,
            amount0Expected + 1,
            amount1Expected + 1,
            address(this),
            block.timestamp,
            Constants.ZERO_BYTES
        );
    }

    function testAgentCounterHooks() public {
        // Initial state - no swaps yet
        assertEq(hook.beforeSwapCount(poolId), 0);
        assertEq(hook.afterSwapCount(poolId), 0);
        assertEq(hook.getPoolSwapCount(poolKey), 0);
        assertEq(hook.getAgentSwapCount(poolKey, address(this)), 0);

        // Perform a test swap
        uint256 amountIn = 1e18;
        BalanceDelta swapDelta = swapRouter.swapExactTokensForTokens({
            amountIn: amountIn,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        assertEq(int256(swapDelta.amount0()), -int256(amountIn));

        // Verify counters incremented
        assertEq(hook.beforeSwapCount(poolId), 1);
        assertEq(hook.afterSwapCount(poolId), 1);
        assertEq(hook.getPoolSwapCount(poolKey), 1);
    }

    function testAgentSwapCount() public {
        // Perform first swap
        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        // Note: The sender tracked is the swapRouter, not address(this)
        assertEq(hook.getAgentSwapCount(poolKey, address(swapRouter)), 1);

        // Perform second swap
        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: false,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        // Verify agent swap count incremented
        assertEq(hook.getAgentSwapCount(poolKey, address(swapRouter)), 2);
        assertEq(hook.getPoolSwapCount(poolKey), 2);
    }

    function testMultipleSwaps() public {
        // Perform multiple swaps
        for (uint256 i = 0; i < 5; i++) {
            swapRouter.swapExactTokensForTokens({
                amountIn: 0.1e18,
                amountOutMin: 0,
                zeroForOne: i % 2 == 0,
                poolKey: poolKey,
                hookData: Constants.ZERO_BYTES,
                receiver: address(this),
                deadline: block.timestamp + 1
            });
        }

        // Verify total counts
        assertEq(hook.beforeSwapCount(poolId), 5);
        assertEq(hook.afterSwapCount(poolId), 5);
        assertEq(hook.getPoolSwapCount(poolKey), 5);
    }

    function testAgentSwapEvent() public {
        // Expect the AgentSwap event to be emitted
        vm.expectEmit(true, true, false, true);
        emit AgentCounter.AgentSwap(poolId, address(swapRouter), 1, 1);

        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });
    }
}
