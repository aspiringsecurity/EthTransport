//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";

import "hardhat/console.sol";

contract SiteManager is Ownable {
  // Reference to a registry that matches the ENS interface
  ENS private immutable s_ens;

  // The domain to create subdomains from, this contract needs to be the owner or an operator
  bytes32 private immutable s_manageNode;

  // Default resolver to use when creating subdomains
  address public s_defaultResolver;

  event SubdomainRegistered (address owner, bytes32 indexed label);

  constructor(ENS _registryAddr, address _resolverAddr, bytes32 _manageNode) {
    s_ens = _registryAddr;
    s_defaultResolver = _resolverAddr;
    s_manageNode = _manageNode;
  }

  /**
    * Currently risky in that any contract address could be passed in and this blows
    * up later during a subdomain registration
    * TODO verification by interface ids?
    */
  function setDefaultResolver (address resolver) external onlyOwner {
    s_defaultResolver = resolver;
  }

  /**
    * Create a subnode for the managed node and update the resolver with
    * with function calls from `data`. Finally, set the owner of the subnode
    * to be the `msg.sender`
    */
  function subdomainRegister (bytes32 label, bytes[] calldata data) external returns (bytes[] memory results) {
    address resolverAddr = s_defaultResolver;

    // Create the subdomain through this contract so that the contract is the owner, temporarily
    s_ens.setSubnodeRecord(s_manageNode, label, address(this), resolverAddr, 500);

    // Update all the records by calling the current default resolver
    results = new bytes[](data.length);
    for (uint i = 0; i < data.length; i++) {
      (bool success, bytes memory result) = resolverAddr.call(data[i]);
      require(success, "Failed calling to ENS resolver");
      results[i] = result;
    }

    // Transfer ownership of subdomain to sender
    s_ens.setSubnodeOwner(s_manageNode, label, msg.sender);

    emit SubdomainRegistered(msg.sender, label);
    return results;
  }
}
