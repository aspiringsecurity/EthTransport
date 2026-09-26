// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

/// @notice Deploy two mock ERC20 tokens for testing on Sepolia
contract DeployTokensScript is Script {
    function run() public {
        vm.startBroadcast();

        // Deploy Token A
        MockERC20 tokenA = new MockERC20("Token A", "TKNA", 18);
        tokenA.mint(msg.sender, 1_000_000 ether);
        console.log("Token A deployed:", address(tokenA));

        // Deploy Token B
        MockERC20 tokenB = new MockERC20("Token B", "TKNB", 18);
        tokenB.mint(msg.sender, 1_000_000 ether);
        console.log("Token B deployed:", address(tokenB));

        vm.stopBroadcast();

        // Sort tokens (Uniswap requires token0 < token1)
        (address token0, address token1) = address(tokenA) < address(tokenB)
            ? (address(tokenA), address(tokenB))
            : (address(tokenB), address(tokenA));

        console.log("\n=== Update BaseScript.sol with these addresses ===");
        console.log("token0:", token0);
        console.log("token1:", token1);
    }
}
