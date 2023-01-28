// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* this version is the backend token transfer design
 * the user will call the reward functions themselves passing in some wcid
 * later the backend will verify these submissions, and transfer the rewards to the users directly.
 */

contract LagrangePlatform is Ownable {
    IERC20 public lagrangeToken;

    event DataUpload(string wcid, uint size, uint reward);
    event ModelUpload(string wcid, uint reward);
    event Claim(address claimer, uint amount);

    constructor(address lagrangeTokenAddress) {
        lagrangeToken = IERC20(lagrangeTokenAddress);
    }

    function rewardDataUpload(string memory wcid, uint size) public {
        require(size > 0, "data cannot be size 0");

        uint numGB = size / (10 ** 9);

        uint reward;
        if (numGB == 0) {
            reward = 1 ether;
        } else {
            reward = 0.5 ether * numGB;
        }
        emit DataUpload(wcid, size, reward);
    }

    function rewardModelUpload(string memory wcid) public {
        uint reward = 2 ether;
        emit ModelUpload(wcid, reward);
    }

    function withdraw(uint amount) public onlyOwner {
        require (amount <= lagrangeToken.balanceOf(address(this)), "Not enough balance to withdraw");
        lagrangeToken.transfer(msg.sender, amount);
    }
}