const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SwapAuction contract...");

  const SwapAuction = await ethers.getContractFactory("SwapAuction");
  const swapAuction = await SwapAuction.deploy();

  await swapAuction.waitForDeployment();

  console.log("SwapAuction contract deployed to:", swapAuction.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
