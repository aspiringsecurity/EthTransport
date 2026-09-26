// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {AgentCounter} from "../src/AgentCounter.sol";

/// @notice Mine salt off-chain for AgentCounter hook deployment
contract MineSaltScript is Script {
    // Sepolia PoolManager
    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;

    // Hook flags mask (bottom 14 bits)
    uint160 constant FLAG_MASK = 0x3FFF;

    function run() public pure {
        // Required flags for AgentCounter hook (beforeSwap + afterSwap)
        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG);

        bytes memory constructorArgs = abi.encode(POOL_MANAGER);
        bytes memory creationCode = abi.encodePacked(type(AgentCounter).creationCode, constructorArgs);
        bytes32 initCodeHash = keccak256(creationCode);

        console.log("Mining salt for AgentCounter hook deployment...");
        console.log("Required flags:", uint256(flags & FLAG_MASK));
        console.log("Init code hash:");
        console.logBytes32(initCodeHash);

        // Mine the salt
        for (uint256 salt = 0; salt < 2000000; salt++) {
            address hookAddress = computeAddress(CREATE2_FACTORY, bytes32(salt), initCodeHash);

            if (uint160(hookAddress) & FLAG_MASK == flags & FLAG_MASK) {
                console.log("\n=== FOUND! ===");
                console.log("Salt:", salt);
                console.log("Salt (bytes32):");
                console.logBytes32(bytes32(salt));
                console.log("Hook address:", hookAddress);
                return;
            }

            if (salt % 100000 == 0 && salt > 0) {
                console.log("Checked", salt, "salts...");
            }
        }

        console.log("No salt found in range");
    }

    function computeAddress(address deployer, bytes32 salt, bytes32 initCodeHash)
        internal
        pure
        returns (address)
    {
        return address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xFF), deployer, salt, initCodeHash))))
        );
    }
}
