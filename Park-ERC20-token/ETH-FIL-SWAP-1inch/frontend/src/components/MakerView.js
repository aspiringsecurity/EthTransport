import React, { useState, useEffect } from "react";
import { ethers, parseEther } from "ethers";
import erc20 from "../Erc20.json";
import { Key, Send, Gift, CheckCircle2, Clock } from "lucide-react";

const CHAIN_A_CONFIG = {
  name: "Sepolia",
  escrowAddress: "0xDDF9D2f8B1a4674752630efD74F062720d319149",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
};

const CHAIN_B_CONFIG = {
  name: "Filecoin Calibration",
  escrowAddress: "0x9a09103d9dF6d2C6a9DAd7e188AC45Ae11e19beb",
  rpcUrl: "https://rpc.ankr.com/filecoin_testnet",
};

const MakerView = ({
  auction,
  contractChainAWithSigner,
  contractChainB,
  contractChainA,
  contractChainBWithSigner,
  account,
  signer,
}) => {
  const [secret, setSecret] = useState("");
  const [hashedSecret, setHashedSecret] = useState("");
  const [swapId, setSwapId] = useState("");
  const [swapState, setSwapState] = useState("Not Started");

  // Main logic to generate secret
  const generateSecretAndHash = () => {
    const newSecret = ethers.randomBytes(32);
    console.log("Generated Secret (bytes):", newSecret);
    const newHashedSecret = ethers.sha256(newSecret);

    setSecret(ethers.hexlify(newSecret));
    setHashedSecret(newHashedSecret);
    console.log("Hashed Secret:", newHashedSecret);
    setSwapId(ethers.zeroPadValue(ethers.toBeHex(auction.id), 32)); // Using auctionId as swapId
    setSwapState("Secret Generated");
  };

  // Maker initiates swap on Chain A
  const initiateOnChainA = async () => {
    const tokenAContract = new ethers.Contract(
      auction.tokenA,
      erc20.abi,
      signer,
    );
    console.log("Approving tokens on Chain A");
    console.log("TokenA Contract:", tokenAContract);
    const approveTx = await tokenAContract.approve(
      CHAIN_A_CONFIG.escrowAddress,
      auction.amountA,
    );
    console.log("Approve transaction sent:", approveTx);
    await approveTx.wait();
    console.log("Approved tokens on Chain A");
    const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    console.log("Initiating swap on Chain A with swapId:", swapId);
    console.log("Hashed Secret:", hashedSecret);
    console.log("Auction Highest Bidder:", auction.highestBidder);
    console.log("Auction Token A:", auction.tokenA);
    console.log("Timelock:", timelock);
    console.log("Auction Amount A:", auction.amountA.toString());
    const tx = await contractChainAWithSigner.initiate(
      swapId,
      auction.highestBidder,
      auction.tokenA,
      auction.amountA,
      hashedSecret,
      timelock,
    );
    await tx.wait();
    setSwapState("Initiated on Chain A");
  };

  // Maker claims funds from Chain B
  const claimOnChainB = async () => {
    const tx = await contractChainBWithSigner.claim(swapId, secret);
    await tx.wait();
    setSwapState("Claimed on Chain B");
  };

  useEffect(() => {
    if (auction && auction.id && contractChainA && contractChainB && account) {
      const currentSwapId = ethers.zeroPadValue(ethers.toBeHex(auction.id), 32);
      setSwapId(currentSwapId);
      fetchPastState(currentSwapId);
    }
  }, [auction, contractChainA, contractChainB, account]);

  // 2. Define an async function to fetch past events
  const fetchPastState = async (currentSwapId) => {
    if (!currentSwapId || currentSwapId === ethers.ZeroHash) {
      return;
    }
    try {
      const latestBlock = await contractChainA.runner.getBlockNumber();
      console.log("Latest Block Number:", latestBlock);
      const fromBlock = Math.max(latestBlock - 10000, 0); // last 1000 blocks

      try {
        // Check if Maker has initiated on Chain A
        console.log("ContractChainA:", contractChainA);
        const initiatedAFilter =
          contractChainA.filters.SwapInitiated(currentSwapId);
        console.log("initiatedAFilter:", initiatedAFilter);
        console.log("current SwapId:", currentSwapId);
        const initiatedAEvents = await contractChainA.queryFilter(
          initiatedAFilter,
          fromBlock,
          latestBlock,
        );
        console.log("initiatedAEvents:", initiatedAEvents);
        console.log("from block:", fromBlock, "to latestBlock:", latestBlock);
        if (initiatedAEvents.length > 0) {
          console.log(
            "Found past SwapInitiated event on Chain A:",
            initiatedAEvents[0],
          );
          const swapDetails = await contractChainA.swaps(currentSwapId);
          if (swapDetails.initiator.toLowerCase() === account.toLowerCase()) {
            setHashedSecret(swapDetails.hashedSecret);
            setSwapState("None");
          }
        }
      } catch (error) {
        console.error("Error checking SwapInitiated on Chain A:", error);
      }

      console.log("ContractChainB:", contractChainB);
      console.log("contractChainB runner:", contractChainB.runner);
      const latestBlockB = await contractChainB.runner.getBlockNumber();
      console.log("Latest Block B Number:", latestBlockB);
      const fromBlockB = Math.max(latestBlockB - 1000, 0); // last 1000 blocks

      try {
        // Check if Maker has initiated on Chain A
        console.log("ContractChainB:", contractChainB);
        const initiatedBFilter =
          contractChainB.filters.SwapInitiated(currentSwapId);
        console.log("initiatedBFilter:", initiatedBFilter);
        console.log("current SwapId:", currentSwapId);
        const initiatedBEvents = await contractChainB.queryFilter(
          initiatedBFilter,
          fromBlockB,
          latestBlockB,
        );
        console.log("initiatedBEvents:", initiatedBEvents);
        console.log("from block:", fromBlockB, "to latestBlock:", latestBlockB);
        if (initiatedBEvents.length > 0) {
          console.log(
            "Found past SwapInitiated event on Chain B:",
            initiatedBEvents[0],
          );
          const swapDetails = await contractChainB.swaps(currentSwapId);
          if (swapDetails.recipient.toLowerCase() === account.toLowerCase()) {
            setHashedSecret(swapDetails.hashedSecret);
            setSwapState("Initiated on Chain B");
          }
        }
      } catch (error) {
        console.error("Error checking SwapInitiated on Chain B:", error);
      }

      console.log("Fetching function ended");
    } catch (error) {
      console.error("Error fetching past state:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
              Maker
            </span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">Your Role</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">{swapState}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-white font-medium">
                Step 1: Generate Secret
              </span>
            </div>
          </div>
          <button
            onClick={generateSecretAndHash}
            disabled={swapState !== "Not Started"}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>Generate Secret</span>
          </button>
          {secret && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-300 text-xs font-semibold mb-1">
                ⚠️ Keep this safe!
              </p>
              <p className="text-gray-300 text-xs font-mono break-all">
                {secret}
              </p>
            </div>
          )}
        </div>

        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white font-medium">
                Step 2: Initiate Swap on {CHAIN_A_CONFIG.name}
              </span>
            </div>
          </div>
          <button
            onClick={initiateOnChainA}
            disabled={swapState !== "Secret Generated"}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Initiate Swap</span>
          </button>
        </div>

        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Gift className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-white font-medium">
                Step 3: Claim from {CHAIN_B_CONFIG.name}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secret
              </label>
              <input
                type="text"
                placeholder="Enter secret to claim"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm font-mono"
              />
            </div>
            <button
              onClick={claimOnChainB}
              disabled={swapState !== "Initiated on Chain B"}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2"
            >
              <Gift className="w-4 h-4" />
              <span>Claim Tokens</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakerView;
