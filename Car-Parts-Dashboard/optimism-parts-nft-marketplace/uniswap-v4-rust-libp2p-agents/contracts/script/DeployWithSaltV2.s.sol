// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {AgentCounterV2} from "../src/AgentCounterV2.sol";

/// @notice Deploy AgentCounterV2 hook with pre-mined salt
/// @dev Run MineSaltV2.s.sol first to find the correct salt, then update SALT and EXPECTED_HOOK below
contract DeployWithSaltV2Script is Script {
    // Sepolia PoolManager
    IPoolManager constant POOL_MANAGER = IPoolManager(0xE03A1074c86CFeDd5C142C4F04F1a1536e203543);

    // Pre-computed salt from MineSaltV2.s.sol
    bytes32 constant SALT = bytes32(uint256(7145));

    // Expected hook address
    address constant EXPECTED_HOOK = 0xA8760B755c67c5C75A8A60ED7E3713eA2448D0C0;

    function run() public {
        console.log("Deploying AgentCounterV2 hook to Sepolia...");
        console.log("Pool Manager:", address(POOL_MANAGER));
        console.log("Expected hook address:", EXPECTED_HOOK);

        vm.startBroadcast();

        AgentCounterV2 agentCounterV2 = new AgentCounterV2{salt: SALT}(POOL_MANAGER);

        vm.stopBroadcast();

        console.log("Hook deployed to:", address(agentCounterV2));
        require(address(agentCounterV2) == EXPECTED_HOOK, "Hook address mismatch!");
        console.log("Deployment successful!");
    }
}
