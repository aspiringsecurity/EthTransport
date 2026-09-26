const { ethers } = require("hardhat");

// --- CONFIGURATION ---
// In a real application, these addresses would come from a configuration file.
const ESCROW_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // PASTE YOUR DEPLOYED EscrowWithSignature ADDRESS HERE
const TOKEN_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";  // PASTE YOUR DEPLOYED TOKEN ADDRESS HERE
// ---------------------

async function main() {
  console.log("--- Preparing to create a maker signature ---");

  if (!ESCROW_CONTRACT_ADDRESS || !TOKEN_CONTRACT_ADDRESS) {
    console.error("ERROR: Please paste the deployed contract addresses in the script!");
    return;
  }

  const [maker, taker] = await ethers.getSigners();
  console.log("Maker (signer) address:", maker.address);
  console.log("Taker (recipient) address:", taker.address);

  const escrow = await ethers.getContractAt("EscrowWithSignature", ESCROW_CONTRACT_ADDRESS);
  const token = await ethers.getContractAt("ERC20Mock", TOKEN_CONTRACT_ADDRESS);

  console.log(`Using Escrow contract at: ${escrow.target}`);
  console.log(`Using Token contract at: ${token.target}`);

  const domain = {
    name: "Escrow",
    version: "1",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: escrow.target
  };

  const types = {
    Swap: [
        { name: "initiator", type: "address" },
        { name: "recipient", type: "address" },
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "timelock", type: "uint256" },
    ]
  };

  const timelock = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

  const swapData = {
    initiator: maker.address,
    recipient: taker.address,
    token: token.target,
    amount: ethers.parseEther("50"), // A smaller amount for a specific swap
    timelock: timelock,
  };

  console.log("\n[INFO] The maker will now sign the following data structure:");
  console.log(swapData);

  const signature = await maker.signTypedData(domain, types, swapData);

  console.log("\n✅ Signature created successfully!");
  console.log("Signature:", signature);

  console.log("\n--- Next Steps ---");
  console.log("The 'swapData' object and the 'signature' can now be given to the taker.");
  console.log("The taker will call the 'execute' function on the Escrow contract.");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });