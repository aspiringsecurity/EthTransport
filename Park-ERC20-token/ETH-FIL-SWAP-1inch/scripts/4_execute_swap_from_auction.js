const { ethers } = require("hardhat");
const { privateKey1, privateKey2 } = require("../secrets.json");

// This script is a template and requires the output from 3_end_swap_auction.js
// It combines the logic of listening for the auction result and executing the swap.

async function executeSwapFromAuction(auctionResult) {
  console.log("\n--- Starting Cross-Chain Swap Execution ---");

  // --- Providers ---
  const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/U-GVSL9PaqaHm-FZCJ4cZ_JI55R66lYm");
  const filecoinProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/filecoin_testnet");

  // --- Wallets / Signers ---
  const maker = new ethers.Wallet(privateKey1, sepoliaProvider);
  const taker = new ethers.Wallet(privateKey2, filecoinProvider);

  console.log(`Maker address: ${maker.address}`);
  console.log(`Taker address: ${taker.address}`);

  // --- Verify addresses from auction match secrets.json ---
  if (maker.address.toLowerCase() !== auctionResult.maker.toLowerCase()) {
    throw new Error("Maker address from auction does not match privateKey1");
  }
  if (taker.address.toLowerCase() !== auctionResult.taker.toLowerCase()) {
    throw new Error("Taker address from auction does not match privateKey2");
  }

  // --- Contract Addresses ---
  const escrowSepoliaAddress = "0x3B469d926876f10cA002E5Cf20776745aAcDFd3A";
  const escrowFilecoinAddress = "0x6A6D7a69A302Ca8B41D7D00eD7019997854F587B";

  // --- Get Contract ABIs ---
  const escrowArtifact = await hre.artifacts.readArtifact("Escrow");
  const tokenArtifact = await hre.artifacts.readArtifact("ERC20Mock");

  // --- Get Contract Instances and connect signers ---
  const escrowSepolia = new ethers.Contract(escrowSepoliaAddress, escrowArtifact.abi, maker);
  const tokenA = new ethers.Contract(auctionResult.tokenA, tokenArtifact.abi, maker);
  const escrowFilecoin = new ethers.Contract(escrowFilecoinAddress, escrowArtifact.abi, taker);
  const tokenB = new ethers.Contract(auctionResult.tokenB, tokenArtifact.abi, taker);

  // --- 1. Secret Generation (by Maker) ---
  const secret = ethers.randomBytes(32);
  const hashedSecret = ethers.sha256(secret);
  console.log("\nGenerated Secret:", ethers.hexlify(secret));
  console.log("Generated Hashed Secret:", hashedSecret);

  // --- Mint tokens for Maker to ensure they have balance ---
  console.log(`\nMinting ${ethers.formatUnits(auctionResult.amountA, 18)} TokenA to Maker...`);
  let mintTx = await tokenA.mint(maker.address, auctionResult.amountA);
  await mintTx.wait();
  console.log("Mint transaction hash:", mintTx.hash);

  // --- 2. Approve and Initiate on Sepolia (Chain A by Maker) ---
  console.log(`\nApproving Sepolia Escrow to spend ${ethers.formatUnits(auctionResult.amountA, 18)} TokenA...`);
  let tx = await tokenA.approve(escrowSepolia.target, auctionResult.amountA);
  await tx.wait();
  console.log("Approve transaction hash:", tx.hash);

  const swapIdA = ethers.id(`sepolia-swap-${auctionResult.auctionId}-${Date.now()}`);
  const timelockA = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  console.log(`Initiating swap on Sepolia for Taker (${taker.address})...
`);
  tx = await escrowSepolia.initiate(
    swapIdA,
    taker.address,
    tokenA.target,
    auctionResult.amountA,
    hashedSecret,
    timelockA
  );
  await tx.wait();
  console.log("Swap initiated on Sepolia. Tx hash:", tx.hash);

  // --- Mint tokens for Taker to ensure they have balance ---
  console.log(`\nMinting ${ethers.formatUnits(auctionResult.amountB, 18)} TokenB to Taker...`);
  mintTx = await tokenB.mint(taker.address, auctionResult.amountB);
  await mintTx.wait();
  console.log("Mint transaction hash:", mintTx.hash);

  // --- 3. Approve and Initiate on Filecoin (Chain B by Taker) ---
  console.log(`\nApproving Filecoin Escrow to spend ${ethers.formatUnits(auctionResult.amountB, 18)} TokenB...`);
  tx = await tokenB.approve(escrowFilecoin.target, auctionResult.amountB);
  await tx.wait();
  console.log("Approve transaction hash:", tx.hash);

  const swapIdB = ethers.id(`filecoin-swap-${auctionResult.auctionId}-${Date.now()}`);
  const timelockB = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
  console.log(`Initiating swap on Filecoin for Maker (${maker.address})...
`);
  tx = await escrowFilecoin.initiate(
    swapIdB,
    maker.address,
    tokenB.target,
    auctionResult.amountB,
    hashedSecret,
    timelockB
  );
  await tx.wait();
  console.log("Swap initiated on Filecoin. Tx hash:", tx.hash);

  // --- 4. Claim Swap on Filecoin (Chain B by Maker) ---
  const escrowFilecoinForMaker = new ethers.Contract(escrowFilecoinAddress, escrowArtifact.abi, maker.connect(filecoinProvider));
  console.log("\nClaiming swap on Filecoin...");
  tx = await escrowFilecoinForMaker.claim(swapIdB, secret);
  await tx.wait();
  console.log("Swap claimed on Filecoin. Tx hash:", tx.hash);

  // --- 5. Claim Swap on Sepolia (Chain A by Taker) ---
  const escrowSepoliaForTaker = new ethers.Contract(escrowSepoliaAddress, escrowArtifact.abi, taker.connect(sepoliaProvider));
  console.log("\nClaiming swap on Sepolia...");
  tx = await escrowSepoliaForTaker.claim(swapIdA, secret);
  await tx.wait();
  console.log("Swap claimed on Sepolia. Tx hash:", tx.hash);

  console.log("\nAtomic Swap Complete!");
}

// --- Example Usage ---
// In a real application, you would get this object from the event listener
// in 3_end_swap_auction.js

async function run() {
    const exampleAuctionResult = {
        auctionId: 1,
        maker: "0x8d066aA091a925Cf4B99E009c8c1033c7F227Eb7",
        taker: "0x111fcd4646a71Ae7d2bdFbC66207803435976fc6",
        tokenA: "0x7F1f595B7b47986b8B5a12731759225a2CcABfFC",
        amountA: ethers.parseUnits("1", 18),
        tokenB: "0x1114CC447697E1f981FD83107f3a65146aa918Cd",
        amountB: ethers.parseUnits("2", 18)
    };

    // You would replace this with the actual result from the event
    await executeSwapFromAuction(exampleAuctionResult);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
