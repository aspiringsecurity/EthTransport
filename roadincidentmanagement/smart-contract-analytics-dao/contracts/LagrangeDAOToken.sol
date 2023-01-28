// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LagrangeDAOToken is ERC20Capped, Ownable {
    uint public constant TOKEN_CAP = 1 ether * 10 ** 9;
    uint public constant INITAL_AMOUNT = TOKEN_CAP * 15 / 100;
    bool public initialized = false;


    constructor() ERC20Capped(TOKEN_CAP) ERC20("Lagrange DAO Token", "LAD") {
    }

    function initialize (address holder) public onlyOwner {
        initialized = true;
        ERC20._mint(holder, INITAL_AMOUNT);
    }

    function mint(address to, uint amount) public onlyOwner {
        require(initialized, "token is not initialized");
        _mint(to, amount);
    }


}