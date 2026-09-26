
const { ethers } = require("hardhat");

async function main() {
  console.log("--- Approving Tokens for the Escrow Contract ---");

  // This would be the known, deployed address of your EscrowWithSignature contract
  // For this example, we deploy it first to get an address.
  const Escrow = await ethers.getContractFactory("EscrowWithSignature");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = escrow.target;
  console.log(`EscrowWithSignature contract deployed at: ${escrowAddress}`);

  // We also need a token contract to approve.
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  const token = await ERC20Mock.deploy("Mock Token", "MTK");
  await token.waitForDeployment();
  const tokenAddress = token.target;
  console.log(`Mock Token deployed at: ${tokenAddress}`);

  const [maker] = await ethers.getSigners();
  console.log(`Maker address: ${maker.address}`);

  // Mint some tokens for the maker
  const mintAmount = ethers.parseEther("10000");
  await token.mint(maker.address, mintAmount);
  console.log(`Minted ${ethers.formatEther(mintAmount)} tokens for the maker`);

  // The amount to approve. Using a large number is common to avoid re-approving.
  const approveAmount = ethers.parseEther("1000");

  console.log(`
[INFO] Maker will now send an on-chain transaction to approve the Escrow contract.`);
  console.log(`   - Token: ${tokenAddress}`);
  console.log(`   - Spender: ${escrowAddress}`);
  console.log(`   - Amount: ${ethers.formatEther(approveAmount)} tokens`);

  // The actual approval transaction
  const tx = await token.connect(maker).approve(escrowAddress, approveAmount);
  await tx.wait();

  console.log("\n✅ Approval transaction successful!");
  console.log(`Transaction hash: ${tx.hash}`);

  // Verify the allowance
  const allowance = await token.allowance(maker.address, escrowAddress);
  console.log(`
Current allowance for Escrow contract: ${ethers.formatEther(allowance)} tokens`);
  console.log("\n--- Setup Complete ---");
  console.log("The maker can now create off-chain signatures for swaps.");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
