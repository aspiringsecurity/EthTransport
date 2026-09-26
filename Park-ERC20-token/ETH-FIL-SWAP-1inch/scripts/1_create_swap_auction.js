const { ethers } = require("hardhat");
const { privateKey1 } = require("../secrets.json");

async function main() {
  // --- Provider ---
  const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/U-GVSL9PaqaHm-FZCJ4cZ_JI55R66lYm");

  // --- Wallet / Signer ---
  const maker = new ethers.Wallet(privateKey1, sepoliaProvider);
  console.log(`Maker's address: ${maker.address}`);

  // --- Contract Addresses ---
  const swapAuctionAddress = "0xF7015cC82A0980152521fc3B31A5bb267A625f35"; // TODO: Replace with your deployed contract address
  const tokenAAddress = "0x7F1f595B7b47986b8B5a12731759225a2CcABfFC"; // TokenA on Sepolia
  const tokenBAddress = "0x1114CC447697E1f981FD83107f3a65146aa918Cd"; // TokenB on Filecoin

  // --- Get Contract ABI ---
  const swapAuctionArtifact = await hre.artifacts.readArtifact("SwapAuction");

  // --- Get Contract Instance and connect signer ---
  const swapAuction = new ethers.Contract(swapAuctionAddress, swapAuctionArtifact.abi, maker);

  // --- Auction Parameters ---
  const amountA = ethers.parseUnits("1", 18); // Maker offers 1 TokenA
  const minAmountB = ethers.parseUnits("1.9", 18); // Maker wants at least 1.9 TokenB
  const duration = 60; // 60 seconds

  // --- Create Auction ---
  console.log("\nCreating a new swap auction...");
  const tx = await swapAuction.createAuction(
    tokenAAddress,
    amountA,
    tokenBAddress,
    minAmountB,
    duration
  );
  await tx.wait();

  console.log("Swap auction created successfully!");
  console.log(`Transaction hash: ${tx.hash}`);

  // --- Listen for the AuctionCreated event to get the auctionId ---
  const receipt = await sepoliaProvider.getTransactionReceipt(tx.hash);
  const log = receipt.logs[0];
  const parsedLog = swapAuction.interface.parseLog(log);
  const auctionId = parsedLog.args.auctionId;

  console.log(`
Auction Details:
  Auction ID: ${auctionId}
  Maker: ${parsedLog.args.maker}
  Token A: ${parsedLog.args.tokenA}
  Amount A: ${ethers.formatUnits(parsedLog.args.amountA, 18)}
  Token B: ${parsedLog.args.tokenB}
  Min Amount B: ${ethers.formatUnits(parsedLog.args.minAmountB, 18)}
  End Time: ${new Date(Number(parsedLog.args.endTime) * 1000)}

`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
