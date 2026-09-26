// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";

import {BaseScript} from "./base/BaseScript.sol";

import {AgentCounter} from "../src/AgentCounter.sol";

/// @notice Mines the address and deploys the AgentCounter Hook contract
contract DeployHookScript is BaseScript {
    function run() public {
        // Hook contracts must have specific flags encoded in the address
        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG);

        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(poolManager);
        (address hookAddress, bytes32 salt) =
            HookMiner.find(CREATE2_FACTORY, flags, type(AgentCounter).creationCode, constructorArgs);

        // Deploy the hook using CREATE2
        vm.startBroadcast();
        AgentCounter agentCounter = new AgentCounter{salt: salt}(poolManager);
        vm.stopBroadcast();

        require(address(agentCounter) == hookAddress, "DeployHookScript: Hook Address Mismatch");
    }
}
