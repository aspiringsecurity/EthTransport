// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {AgentCounter} from "../src/AgentCounter.sol";

/// @notice Deploy AgentCounter hook with pre-mined salt
/// @dev Run MineSalt.s.sol first to find the correct salt
contract DeployWithSaltScript is Script {
    // Sepolia PoolManager
    IPoolManager constant POOL_MANAGER = IPoolManager(0xE03A1074c86CFeDd5C142C4F04F1a1536e203543);

    // Pre-computed salt from MineSalt.s.sol
    bytes32 constant SALT = bytes32(uint256(36542));

    // Expected hook address
    address constant EXPECTED_HOOK = 0x5D4505AA950a73379B8E9f1116976783Ba8340C0;

    function run() public {
        console.log("Deploying AgentCounter hook to Sepolia...");
        console.log("Pool Manager:", address(POOL_MANAGER));
        console.log("Expected hook address:", EXPECTED_HOOK);

        vm.startBroadcast();

        AgentCounter agentCounter = new AgentCounter{salt: SALT}(POOL_MANAGER);

        vm.stopBroadcast();

        console.log("Hook deployed to:", address(agentCounter));
        require(address(agentCounter) == EXPECTED_HOOK, "Hook address mismatch!");
        console.log("Deployment successful!");
    }
}
