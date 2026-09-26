const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();

  console.log("Escrow deployed to:", await escrow.getAddress());

  const Token = await ethers.getContractFactory("ERC20Mock");
  const token = await Token.deploy("TokenB", "TKB");

  console.log("TokenB deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
