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
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";

import {EasyPosm} from "./utils/libraries/EasyPosm.sol";

import {AgentCounterV2} from "../src/AgentCounterV2.sol";
import {BaseTest} from "./utils/BaseTest.sol";

contract AgentCounterV2Test is BaseTest {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    Currency currency0;
    Currency currency1;

    PoolKey poolKey;

    AgentCounterV2 hook;
    PoolId poolId;

    uint256 tokenId;
    int24 tickLower;
    int24 tickUpper;

    // Simulated agent addresses
    address agent1 = address(0xA1);
    address agent2 = address(0xA2);

    function setUp() public {
        deployArtifactsAndLabel();

        (currency0, currency1) = deployCurrencyPair();

        // Deploy the hook with correct V2 flags: afterInitialize + beforeSwap + afterSwap
        address flags = address(
            uint160(Hooks.AFTER_INITIALIZE_FLAG | Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG)
                ^ (0x4444 << 144)
        );
        bytes memory constructorArgs = abi.encode(poolManager);
        deployCodeTo("AgentCounterV2.sol:AgentCounterV2", constructorArgs, flags);
        hook = AgentCounterV2(flags);

        // Create the pool with DYNAMIC_FEE_FLAG (required for fee overrides)
        poolKey = PoolKey(currency0, currency1, LPFeeLibrary.DYNAMIC_FEE_FLAG, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        // Provide full-range liquidity
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
            poolKey, tickLower, tickUpper, liquidityAmount, amount0Expected + 1, amount1Expected + 1, address(this), block.timestamp, Constants.ZERO_BYTES
        );
    }

    function testV2CounterHooks() public {
        // Initial state
        assertEq(hook.beforeSwapCount(poolId), 0);
        assertEq(hook.afterSwapCount(poolId), 0);
        assertEq(hook.getPoolSwapCount(poolKey), 0);

        // Swap with agent1 encoded in hookData
        bytes memory hookData = abi.encode(agent1);
        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: hookData,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        assertEq(hook.beforeSwapCount(poolId), 1);
        assertEq(hook.afterSwapCount(poolId), 1);
        assertEq(hook.getPoolSwapCount(poolKey), 1);
    }

    function testV2AgentTracking() public {
        bytes memory hookData1 = abi.encode(agent1);
        bytes memory hookData2 = abi.encode(agent2);

        // Agent 1 swaps twice
        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: hookData1,
            receiver: address(this),
            deadline: block.timestamp + 1
        });
        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: false,
            poolKey: poolKey,
            hookData: hookData1,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        // Agent 2 swaps once
        swapRouter.swapExactTokensForTokens({
            amountIn: 0.5e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: hookData2,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        // Verify per-agent tracking (agent EOA, not router)
        assertEq(hook.getAgentSwapCount(poolKey, agent1), 2);
        assertEq(hook.getAgentSwapCount(poolKey, agent2), 1);
        assertEq(hook.getAgentSwapCount(poolKey, address(swapRouter)), 0);
        assertEq(hook.getPoolSwapCount(poolKey), 3);
    }

    function testV2FeeRebate() public {
        bytes memory hookData = abi.encode(agent1);

        // Perform REBATE_THRESHOLD swaps to qualify for rebate
        for (uint256 i = 0; i < hook.REBATE_THRESHOLD(); i++) {
            swapRouter.swapExactTokensForTokens({
                amountIn: 0.1e18,
                amountOutMin: 0,
                zeroForOne: i % 2 == 0,
                poolKey: poolKey,
                hookData: hookData,
                receiver: address(this),
                deadline: block.timestamp + 1
            });
        }

        // Agent should now have the rebate fee
        assertEq(hook.getAgentSwapCount(poolKey, agent1), hook.REBATE_THRESHOLD());
        assertEq(hook.getAgentFee(poolKey, agent1), hook.REBATE_FEE());
    }

    function testV2BaseFeeBeforeThreshold() public {
        bytes memory hookData = abi.encode(agent1);

        // Perform fewer swaps than threshold
        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: hookData,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        // Agent should still pay base fee
        assertEq(hook.getAgentSwapCount(poolKey, agent1), 1);
        assertEq(hook.getAgentFee(poolKey, agent1), hook.BASE_FEE());
    }

    function testV2EmptyHookDataFallback() public {
        // Swap without hookData — should fall back to sender (router) tracking
        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        // Counters still increment
        assertEq(hook.getPoolSwapCount(poolKey), 1);
        // Falls back to router as the tracked agent
        assertEq(hook.getAgentSwapCount(poolKey, address(swapRouter)), 1);
    }

    function testV2AgentSwapEvent() public {
        bytes memory hookData = abi.encode(agent1);

        vm.expectEmit(true, true, false, true);
        emit AgentCounterV2.AgentSwap(poolId, agent1, 1, 1);

        swapRouter.swapExactTokensForTokens({
            amountIn: 1e18,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: hookData,
            receiver: address(this),
            deadline: block.timestamp + 1
        });
    }
}
