// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    struct Swap {
        address payable initiator;
        address payable recipient;
        address token;
        uint256 amount;
        bytes32 hashedSecret;
        uint256 timelock;
        bool claimed;
        bool refunded;
    }

    mapping(bytes32 => Swap) public swaps;

    event SwapInitiated(bytes32 indexed swapId, bytes32 hashedSecret);
    event SwapClaimed(bytes32 indexed swapId, bytes32 secret);
    event SwapRefunded(bytes32 indexed swapId);

    function initiate(
        bytes32 swapId,
        address payable recipient,
        address token,
        uint256 amount,
        bytes32 hashedSecret,
        uint256 timelock
    ) external {
        require(swaps[swapId].initiator == address(0), "Swap already initiated");
        require(timelock > block.timestamp, "Timelock must be in the future");

        swaps[swapId] = Swap({
            initiator: payable(msg.sender),
            recipient: recipient,
            token: token,
            amount: amount,
            hashedSecret: hashedSecret,
            timelock: timelock,
            claimed: false,
            refunded: false
        });

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit SwapInitiated(swapId, hashedSecret);
    }

    function claim(bytes32 swapId, bytes32 secret) external {
        Swap storage swap = swaps[swapId];
        require(swap.initiator != address(0), "Swap does not exist");
        require(!swap.claimed, "Swap already claimed");
        require(swap.recipient == msg.sender, "Only recipient can claim");
        require(swap.hashedSecret == sha256(abi.encodePacked(secret)), "Invalid secret");
        require(block.timestamp < swap.timelock, "Timelock expired");

        swap.claimed = true;
        IERC20(swap.token).transfer(swap.recipient, swap.amount);
        emit SwapClaimed(swapId, bytes32(secret));
    }

    function refund(bytes32 swapId) external {
        Swap storage swap = swaps[swapId];
        require(swap.initiator != address(0), "Swap does not exist");
        require(!swap.claimed, "Swap already claimed");
        require(!swap.refunded, "Swap already refunded");
        require(block.timestamp >= swap.timelock, "Timelock not expired yet");
        require(swap.initiator == msg.sender, "Only initiator can refund");

        swap.refunded = true;
        IERC20(swap.token).transfer(swap.initiator, swap.amount);
        emit SwapRefunded(swapId);
    }
}
