// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    // Errors
    error NotEnoughEther(string notEnoughMessage);
    error MaxSupplyReached(string maxSupplyMessage);

    // Variables
    uint256 public price = 0.1 ether;

    // Constants
    uint256 public constant TOTAL_SUPPLY = 10_000;

    Counters.Counter private currentTokenId;

    /// @dev Base token URI used as a prefix by tokenURI().
    string public baseTokenURI;

    constructor() ERC721("NFTTutorial", "NFT") {
        baseTokenURI = "";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return baseTokenURI;
    }

    /// @dev Sets the price for the NFT.
    function setTokenPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    /// @dev Sets the base token URI prefix.
    function setBaseTokenURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    /// @notice This function substitutes the previous withdraw function
    /// @dev This function is used to withdraw the funds from the contract
    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    /// @notice Solidity 8 error handling
    /// @dev mint funciton to specific address
    function mintTo(address recipient) public payable returns (uint256) {
        uint256 tokenId = currentTokenId.current();

        if (tokenId >= TOTAL_SUPPLY) {
            revert MaxSupplyReached("Max supply reached");
        }
        if (msg.value < price) {
            revert NotEnoughEther("Not enough ether");
        }

        currentTokenId.increment();
        uint256 newItemId = currentTokenId.current();
        _safeMint(recipient, newItemId);
        return newItemId;
    }
}
