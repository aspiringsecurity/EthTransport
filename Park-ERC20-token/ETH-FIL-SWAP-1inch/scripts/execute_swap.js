const { ethers } = require("hardhat");
const { privateKey1, privateKey2 } = require("../secrets.json");

async function main() {
  // --- Providers ---
  const sepoliaProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/U-GVSL9PaqaHm-FZCJ4cZ_JI55R66lYm");
  const filecoinProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/filecoin_testnet");

  // --- Wallets / Signers ---
  const alice = new ethers.Wallet(privateKey1, sepoliaProvider);
  const bob = new ethers.Wallet(privateKey2, filecoinProvider);

  console.log(`Alice's address: ${alice.address}`);
  console.log(`Bob's address: ${bob.address}`);

  // --- Contract Addresses ---
  const escrowSepoliaAddress = "0x3B469d926876f10cA002E5Cf20776745aAcDFd3A";
  const tokenASepoliaAddress = "0x7F1f595B7b47986b8B5a12731759225a2CcABfFC";
  const escrowFilecoinAddress = "0x6A6D7a69A302Ca8B41D7D00eD7019997854F587B";
  const tokenBFilecoinAddress = "0x1114CC447697E1f981FD83107f3a65146aa918Cd";

  // --- Get Contract ABIs ---
  const escrowArtifact = await hre.artifacts.readArtifact("Escrow");
  const tokenArtifact = await hre.artifacts.readArtifact("ERC20Mock");

  // --- Get Contract Instances and connect signers ---
  const escrowSepolia = new ethers.Contract(escrowSepoliaAddress, escrowArtifact.abi, alice);
  const tokenASepolia = new ethers.Contract(tokenASepoliaAddress, tokenArtifact.abi, alice);
  const escrowFilecoin = new ethers.Contract(escrowFilecoinAddress, escrowArtifact.abi, bob);
  const tokenBFilecoin = new ethers.Contract(tokenBFilecoinAddress, tokenArtifact.abi, bob);


  // --- 1. Secret Generation ---
  const secret = ethers.randomBytes(32);
  const hashedSecret = ethers.sha256(secret);
  console.log("\nGenerated Secret:", ethers.hexlify(secret));
  console.log("Generated Hashed Secret:", hashedSecret);

  // --- 2. Mint and Approve on Sepolia (Chain A) ---
  const amountA = ethers.parseUnits("1", 18); // 1 TokenA for simplicity
  console.log(`\nMinting ${ethers.formatUnits(amountA, 18)} TokenA to Alice on Sepolia...`);
  let tx = await tokenASepolia.mint(alice.address, amountA);
  await tx.wait();
  console.log("Mint transaction hash:", tx.hash);

  console.log("Approving Sepolia Escrow to spend TokenA...");
  tx = await tokenASepolia.approve(escrowSepolia.target, amountA);
  await tx.wait();
  console.log("Approve transaction hash:", tx.hash);


  // --- 3. Initiate Swap on Sepolia (Chain A) ---
  const swapIdA = ethers.id(`sepolia-filecoin-swap-${Date.now()}`);
  const timelockA = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  console.log(`\nInitiating swap on Sepolia for Bob (${bob.address})...`);
  tx = await escrowSepolia.initiate(
    swapIdA,
    bob.address,
    tokenASepolia.target,
    amountA,
    hashedSecret,
    timelockA
  );
  await tx.wait();
  console.log("Swap initiated on Sepolia. Tx hash:", tx.hash);

  // --- 4. Mint and Approve on Filecoin (Chain B) ---
  const amountB = ethers.parseUnits("2", 18); // 2 TokenB
  console.log(`\nMinting ${ethers.formatUnits(amountB, 18)} TokenB to Bob on Filecoin...`);
  tx = await tokenBFilecoin.mint(bob.address, amountB);
  await tx.wait();
  console.log("Mint transaction hash:", tx.hash);

  console.log("Approving Filecoin Escrow to spend TokenB...");
  tx = await tokenBFilecoin.approve(escrowFilecoin.target, amountB);
  await tx.wait();
  console.log("Approve transaction hash:", tx.hash);

  // --- 5. Initiate Swap on Filecoin (Chain B) ---
  const swapIdB = ethers.id(`filecoin-sepolia-swap-${Date.now()}`);
  const timelockB = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
  console.log(`\nInitiating swap on Filecoin for Alice (${alice.address})...`);
  tx = await escrowFilecoin.initiate(
    swapIdB,
    alice.address,
    tokenBFilecoin.target,
    amountB,
    hashedSecret,
    timelockB
  );
  await tx.wait();
  console.log("Swap initiated on Filecoin. Tx hash:", tx.hash);

  // --- 6. Claim Swap on Filecoin (Chain B) ---
  // Alice needs to sign the transaction, but it needs to be sent to the Filecoin network.
  const escrowFilecoinForAlice = new ethers.Contract(escrowFilecoinAddress, escrowArtifact.abi, alice.connect(filecoinProvider));
  console.log("\nClaiming swap on Filecoin...");
  tx = await escrowFilecoinForAlice.claim(swapIdB, secret);
  await tx.wait();
  console.log("Swap claimed on Filecoin. Tx hash:", tx.hash);

  // --- 7. Claim Swap on Sepolia (Chain A) ---
  // Bob needs to sign the transaction, but it needs to be sent to the Sepolia network.
  const escrowSepoliaForBob = new ethers.Contract(escrowSepoliaAddress, escrowArtifact.abi, bob.connect(sepoliaProvider));
  console.log("\nClaiming swap on Sepolia...");
  tx = await escrowSepoliaForBob.claim(swapIdA, secret);
  await tx.wait();
  console.log("Swap claimed on Sepolia. Tx hash:", tx.hash);

  console.log("\nAtomic Swap Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });