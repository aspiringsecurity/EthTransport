const { ethers } = require("hardhat");
const { privateKey1 } = require("../secrets.json");

async function main() {
  // --- Provider ---
  const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/U-GVSL9PaqaHm-FZCJ4cZ_JI55R66lYm");

  // --- Wallet / Signer (anyone can end the auction, using maker's wallet for funds) ---
  const wallet = new ethers.Wallet(privateKey1, sepoliaProvider);

  // --- Contract Addresses ---
  const swapAuctionAddress = "0xF7015cC82A0980152521fc3B31A5bb267A625f35"; // TODO: Replace with your deployed contract address

  // --- Get Contract ABI ---
  const swapAuctionArtifact = await hre.artifacts.readArtifact("SwapAuction");

  // --- Get Contract Instance and connect signer ---
  const swapAuction = new ethers.Contract(swapAuctionAddress, swapAuctionArtifact.abi, wallet);

  // --- Auction ID ---
  const auctionId = 1; // TODO: Replace with the ID of the auction you want to end

  // --- End Auction ---
  console.log(`
Ending auction ${auctionId}...
`);
  const tx = await swapAuction.endAuction(auctionId);
  await tx.wait();

  console.log("Auction ended successfully!");
  console.log(`Transaction hash: ${tx.hash}`);

  // --- Listen for the AuctionEnded event to get the final parameters ---
  console.log("\nListening for AuctionEnded event...");
  const receipt = await sepoliaProvider.getTransactionReceipt(tx.hash);
  const log = receipt.logs[0];
  const parsedLog = swapAuction.interface.parseLog(log);

  if (parsedLog.name === "AuctionEnded") {
    console.log(`
Swap Parameters Determined:
    Auction ID: ${parsedLog.args.auctionId}
    Maker: ${parsedLog.args.maker}
    Taker: ${parsedLog.args.taker}
    Token A: ${parsedLog.args.tokenA}
    Amount A: ${ethers.formatUnits(parsedLog.args.amountA, 18)}
    Token B: ${parsedLog.args.tokenB}
    Amount B: ${ethers.formatUnits(parsedLog.args.amountB, 18)}
  `);
  } else {
    console.log("\nNo winning bids. The auction ended without a taker.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
