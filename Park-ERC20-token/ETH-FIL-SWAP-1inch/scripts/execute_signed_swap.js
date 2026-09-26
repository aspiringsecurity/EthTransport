const { ethers } = require("hardhat");

async function main() {
    console.log("--- Starting Full End-to-End Test Flow for execute_signed_swap.js ---");

    // 1. SETUP: Deploy contracts and get signers
    const [maker, taker] = await ethers.getSigners();
    console.log(`Maker: ${maker.address}, Taker: ${taker.address}`);

    const Escrow = await ethers.getContractFactory("EscrowWithSignature");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
    const escrowAddress = escrow.target;
    console.log(`EscrowWithSignature deployed to: ${escrowAddress}`);

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const token = await ERC20Mock.deploy("Mock Token", "MTK");
    await token.waitForDeployment();
    const tokenAddress = token.target;
    console.log(`Mock Token deployed to: ${tokenAddress}`);

    // 2. MINT & APPROVE: The maker prepares their tokens
    const mintAmount = ethers.parseEther("5000");
    await token.connect(maker).mint(maker.address, mintAmount);
    console.log(`Minted ${ethers.formatEther(mintAmount)} MTK for Maker`);

    const approveAmount = ethers.parseEther("100");
    await token.connect(maker).approve(escrowAddress, approveAmount);
    console.log(`Maker approved Escrow to spend ${ethers.formatEther(approveAmount)} MTK`);
    
    const initialTakerBalance = await token.balanceOf(taker.address);
    console.log(`Initial Taker Balance: ${ethers.formatEther(initialTakerBalance)} MTK`);


    // 3. SIGN: The maker creates the off-chain signature
    const domain = {
        name: "Escrow",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: escrowAddress
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

    const swapData = {
        initiator: maker.address,
        recipient: taker.address,
        token: tokenAddress,
        amount: ethers.parseEther("50"),
        timelock: Math.floor(Date.now() / 1000) + 3600,
    };

    const signature = await maker.signTypedData(domain, types, swapData);
    console.log(`
Maker created signature: ${signature}`);


    // 4. EXECUTE: The taker submits the swap to the blockchain
    console.log("\nTaker is executing the swap...");
    const tx = await escrow.connect(taker).execute(swapData, signature);
    await tx.wait();
    console.log("✅ Swap executed successfully!");
    console.log(`Transaction hash: ${tx.hash}`);

    // 5. VERIFY: Check the final balances
    const finalMakerBalance = await token.balanceOf(maker.address);
    const finalTakerBalance = await token.balanceOf(taker.address);

    console.log("\n--- Final Balances ---");
    console.log(`Maker\'s new balance: ${ethers.formatEther(finalMakerBalance)} MTK`);
    console.log(`Taker\'s new balance: ${ethers.formatEther(finalTakerBalance)} MTK`);
    console.log("--- Test Complete ---");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });