'use strict'

require('dotenv').config()

const hre = require("hardhat");

const { ENS_REGISTRY } = process.env
const { ethers, utils } = hre

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
const labelhash = (label) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
const tld = "eth";

const ensConfigs = {
  ropsten: {
    resolver: { address: '0x42D63ae25990889E35F215bC95884039Ba354115' },
    registry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' }
  }
}

console.log('hre', hre.network)

async function ens() {
  if (hre.network.name !== 'hardhat') {
    return ensConfigs[hre.network.name]
  }

  const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
  const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
  const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar")
  const PublicResolver = await ethers.getContractFactory("PublicResolver")
  const signers = await ethers.getSigners();
  const accounts = signers.map(s => s.address)

  const ens = await ENSRegistry.deploy()
  await ens.deployed()
  const resolver = await PublicResolver.deploy(ens.address, ZERO_ADDRESS);
  await resolver.deployed()
  await setupResolver(ens, resolver, accounts)

  const registrar = await  FIFSRegistrar.deploy(ens.address, ethers.utils.namehash(tld));
  await registrar.deployed()
  await setupRegistrar(ens, registrar, await signers[0].getAddress());

  const reverseRegistrar = await ReverseRegistrar.deploy(ens.address, resolver.address);
  await reverseRegistrar.deployed()
  await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts);

  const contracts = {
    fifs: registrar,
    resolver: resolver,
    registry: ens
  }

  console.log('ENS Contract addresses', Object.keys(contracts).map(k => contracts[k].address))
  return contracts
};

async function setupResolver(ens, resolver, accounts) {
  const resolverNode = ethers.utils.namehash("resolver");
  const resolverLabel = labelhash("resolver");
  await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, accounts[0]);
  await ens.setResolver(resolverNode, resolver.address);
  await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address);
}

async function setupRegistrar(ens, registrar, ownerAddr) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash(tld), registrar.address);

  const regTx = await registrar.register(ethers.utils.id('ethonline2021char'), ownerAddr)
  await regTx.wait()
}

async function setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash("reverse"), accounts[0]);
  await ens.setSubnodeOwner(ethers.utils.namehash("reverse"), labelhash("addr"), reverseRegistrar.address);
}

async function siteManager({ resolver, registry }) {
  const Contract = await ethers.getContractFactory('SiteManager');
  const siteManager = await Contract.deploy(
    registry.address,
    resolver.address,
    ethers.utils.namehash('ethonline2021char.eth')
  );

  await siteManager.deployed();

  console.log("SiteManager deployed to:", siteManager.address);

  if (hre.network.name === 'hardhat') {
    const tx = await resolver.setApprovalForAll(siteManager.address, true)
    const txResult = await tx.wait()

    console.log('approval', txResult)
  }
}

ens()
  .then(siteManager)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
