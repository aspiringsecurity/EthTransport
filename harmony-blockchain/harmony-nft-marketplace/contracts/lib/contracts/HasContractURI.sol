pragma solidity ^0.6.12;

import "./ERC165.sol";

contract HasContractURI is ERC165 {

    string public contractURI;

    /*
     * bytes4(keccak256('contractURI()')) == 0xe8a3d485
     */
    bytes4 private constant _INTERFACE_ID_CONTRACT_URI = 0xe8a3d485;

    constructor(string memory _contractURI) public {
        contractURI = _contractURI;
        _registerInterface(_INTERFACE_ID_CONTRACT_URI);
    }

    /**
     * @dev Internal function to set the contract URI
     * @param _contractURI string URI prefix to assign
     */
    function _setContractURI(string memory _contractURI) internal {
        contractURI = _contractURI;
    }
}