// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager, SwapParams} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

/// @title AgentCounter Hook
/// @notice A Uniswap V4 hook that tracks swap counts per agent address
/// @dev Used by libp2p agents to coordinate and track swaps on-chain
contract AgentCounter is BaseHook {
    using PoolIdLibrary for PoolKey;

    // NOTE: ---------------------------------------------------------
    // state variables should typically be unique to a pool
    // a single hook contract should be able to service multiple pools
    // ---------------------------------------------------------------

    mapping(PoolId => uint256 count) public beforeSwapCount;
    mapping(PoolId => uint256 count) public afterSwapCount;

    /// @notice Mapping from pool ID => agent address => swap count
    mapping(PoolId => mapping(address => uint256)) public agentSwapCount;

    /// @notice Emitted when an agent executes a swap
    event AgentSwap(PoolId indexed poolId, address indexed agent, uint256 agentTotal, uint256 poolTotal);

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
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

    // -----------------------------------------------
    // NOTE: see IHooks.sol for function documentation
    // -----------------------------------------------

    function _beforeSwap(address, PoolKey calldata key, SwapParams calldata, bytes calldata)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        beforeSwapCount[key.toId()]++;
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterSwap(address sender, PoolKey calldata key, SwapParams calldata, BalanceDelta, bytes calldata)
        internal
        override
        returns (bytes4, int128)
    {
        PoolId poolId = key.toId();

        afterSwapCount[poolId]++;
        agentSwapCount[poolId][sender]++;

        // Emit event for off-chain tracking by libp2p agents
        emit AgentSwap(poolId, sender, agentSwapCount[poolId][sender], afterSwapCount[poolId]);

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
}
