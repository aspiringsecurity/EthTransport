// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./LagrangeDAOToken.sol";

contract SpacePayment is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private spaceCounter;

    mapping(uint256 => Space) public idToSpace;
    mapping(address => uint256) private balance;

    // rate is 1 LAD = $0.03
    mapping(uint256 => Hardware) public idToHardware;

    struct Space {
        address owner;
        uint256 hardwareType;
        uint256 expiryBlock;
    }

    struct Hardware {
        string name;
        uint pricePerBlock;
    }

    LagrangeDAOToken public ladToken;

    event SpaceCreated(uint256 id, address owner, uint256 hardwareType, uint256 expiryBlock);
    event ExpiryExtended(uint256 id, uint256 expiryBlock);
    event EpochDurationChanged(uint256 epochDuration);
    event HardwarePriceChanged(uint256 hardwareType, string name, uint256 price);

    constructor(address tokenAddress) {
        ladToken = LagrangeDAOToken(tokenAddress);

        idToHardware[1] = Hardware("CPU only, 2 vCPU, 16 GiB", 0 ether);
        idToHardware[2] = Hardware("CPU only, 8 vCPU, 32 GiB", 1 ether);
        idToHardware[3] = Hardware("Nvidia T4, 4 vCPU, 15 GiB", 20 ether);
        idToHardware[4] = Hardware("Nvidia T4, 8 vCPU, 30 GiB", 30 ether);
        idToHardware[5] = Hardware("Nvidia A10G, 4 vCPU, 15 GiB", 35 ether);
        idToHardware[6] = Hardware("Nvidia A10G, 12 vCPU, 46 GiB", 105 ether);
    }

    function deposit(uint256 amount) public {
        require(
            ladToken.allowance(msg.sender, address(this)) >= amount,
            "ERC20: allowance is too low"
        );

        ladToken.transferFrom(msg.sender, address(this), amount);
        balance[msg.sender] += amount;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balance[account];
    }

    function hardwareInfo(uint hardwareType) public view returns (Hardware memory) {
        return idToHardware[hardwareType];
    }

    function buySpace(uint256 hardwareType, uint256 blocks) public {
        uint256 price = idToHardware[hardwareType].pricePerBlock * blocks;
        require(balance[msg.sender] >= price, "not enough balance");

        uint256 spaceId = spaceCounter.current();
        spaceCounter.increment();

        uint256 expiryBlock = block.number + blocks;
        balance[msg.sender] -= price;
        idToSpace[spaceId] = Space(msg.sender, hardwareType, expiryBlock);

        emit SpaceCreated(spaceId, msg.sender, hardwareType, expiryBlock);
    }

    function extendSpace(uint256 spaceId, uint256 blocks) public {
        Space memory space = idToSpace[spaceId];
        require(space.expiryBlock > 0, "space not found");
        uint256 price = idToHardware[space.hardwareType].pricePerBlock * blocks;
        require(balance[msg.sender] >= price, "not enough balance");

        balance[msg.sender] -= price;
        if (isExpired(spaceId)) {
            idToSpace[spaceId].expiryBlock += block.number + blocks;
        } else {
            idToSpace[spaceId].expiryBlock += blocks;
        }

        emit ExpiryExtended(spaceId, idToSpace[spaceId].expiryBlock);
    }

    function isExpired(uint256 spaceId) public view returns (bool) {
        return idToSpace[spaceId].expiryBlock <= block.number;
    }

    function spaceInfo(uint256 spaceId) public view returns (Space memory) {
        return idToSpace[spaceId];
    }

    function changeHardware(uint256 hardwareType, string memory newName, uint256 newPrice) public onlyOwner {
        idToHardware[hardwareType] = Hardware(newName, newPrice);
        emit HardwarePriceChanged(hardwareType, newName, newPrice);
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(amount <= ladToken.balanceOf(address(this)), "not enough tokens to withdraw");

        ladToken.transfer(msg.sender, amount);
    }
}
