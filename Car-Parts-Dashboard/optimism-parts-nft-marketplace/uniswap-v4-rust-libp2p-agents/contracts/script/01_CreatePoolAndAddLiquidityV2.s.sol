// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {BaseScript} from "./base/BaseScript.sol";
import {LiquidityHelpers} from "./base/LiquidityHelpers.sol";

/// @notice Create V2 pool (dynamic fee) and add liquidity
contract CreatePoolAndAddLiquidityV2Script is BaseScript, LiquidityHelpers {
    using CurrencyLibrary for Currency;

    /////////////////////////////////////
    // --- V2 Pool Configuration ---
    /////////////////////////////////////

    // Dynamic fee flag — required for hook fee overrides
    uint24 lpFee = LPFeeLibrary.DYNAMIC_FEE_FLAG;
    int24 tickSpacing = 60;
    uint160 startingPrice = 2 ** 96; // 1:1 price ratio

    uint256 public token0Amount = 100e18;
    uint256 public token1Amount = 100e18;

    int24 tickLower;
    int24 tickUpper;
    /////////////////////////////////////

    function run() external {
        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: lpFee,
            tickSpacing: tickSpacing,
            hooks: hookContractV2
        });

        bytes memory hookData = new bytes(0);

        int24 currentTick = TickMath.getTickAtSqrtPrice(startingPrice);

        tickLower = truncateTickSpacing((currentTick - 750 * tickSpacing), tickSpacing);
        tickUpper = truncateTickSpacing((currentTick + 750 * tickSpacing), tickSpacing);

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            token0Amount,
            token1Amount
        );

        uint256 amount0Max = token0Amount + 1;
        uint256 amount1Max = token1Amount + 1;

        (bytes memory actions, bytes[] memory mintParams) = _mintLiquidityParams(
            poolKey, tickLower, tickUpper, liquidity, amount0Max, amount1Max, deployerAddress, hookData
        );

        bytes[] memory params = new bytes[](2);
        params[0] = abi.encodeWithSelector(positionManager.initializePool.selector, poolKey, startingPrice, hookData);
        params[1] = abi.encodeWithSelector(
            positionManager.modifyLiquidities.selector, abi.encode(actions, mintParams), block.timestamp + 3600
        );

        uint256 valueToPass = currency0.isAddressZero() ? amount0Max : 0;

        vm.startBroadcast();
        tokenApprovals();
        positionManager.multicall{value: valueToPass}(params);
        vm.stopBroadcast();
    }
}
