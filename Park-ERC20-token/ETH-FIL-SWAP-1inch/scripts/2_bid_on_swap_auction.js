const { ethers } = require("hardhat");
const { privateKey2 } = require("../secrets.json");

async function main() {
  // --- Provider ---
  // Bidding happens on Sepolia, where the SwapAuction contract is deployed
  const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/U-GVSL9PaqaHm-FZCJ4cZ_JI55R66lYm");

  // --- Wallet / Signer ---
  const taker = new ethers.Wallet(privateKey2, sepoliaProvider);
  console.log(`Taker's address: ${taker.address}`);

  // --- Contract Addresses ---
  const swapAuctionAddress = "0xF7015cC82A0980152521fc3B31A5bb267A625f35"; // TODO: Replace with your deployed contract address

  // --- Get Contract ABI ---
  const swapAuctionArtifact = await hre.artifacts.readArtifact("SwapAuction");

  // --- Get Contract Instance and connect signer ---
  const swapAuction = new ethers.Contract(swapAuctionAddress, swapAuctionArtifact.abi, taker);

  // --- Bid Parameters ---
  const auctionId = 1; // TODO: Replace with the ID of the auction you want to bid on
  const amountB = ethers.parseUnits("2", 18); // Taker offers 2 TokenB

  // --- Place Bid ---
  console.log(`
Bidding on auction ${auctionId}...
`);
  const tx = await swapAuction.bid(auctionId, amountB);
  await tx.wait();

  console.log("Bid placed successfully!");
  console.log(`Transaction hash: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
