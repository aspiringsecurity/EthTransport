import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20 from "../Erc20.json";
import { Loader2, Send, Gift, Clock, Eye } from "lucide-react";

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

const TakerView = ({
  auction,
  contractChainA,
  contractChainB,
  contractChainAWithSigner,
  contractChainBWithSigner,
  account,
  signer,
}) => {
  const [secret, setSecret] = useState("");
  const [hashedSecret, setHashedSecret] = useState("");
  const [swapId, setSwapId] = useState("");
  const [swapState, setSwapState] = useState("Not Started");

  // Taker initiates swap on Chain B
  const initiateOnChainB = async () => {
    const tokenBContract = new ethers.Contract(
      auction.tokenB,
      erc20.abi,
      signer,
    );
    const approveTx = await tokenBContract.approve(
      CHAIN_B_CONFIG.escrowAddress,
      auction.highestBid,
    );
    await approveTx.wait();

    const timelock = Math.floor(Date.now() / 1000) + 3500; // Slightly shorter
    const tx = await contractChainBWithSigner.initiate(
      swapId,
      auction.maker,
      auction.tokenB,
      auction.highestBid,
      hashedSecret, // Must be the same hash
      timelock,
    );
    await tx.wait();
    setSwapState("Initiated on Chain B");
  };

  // Taker claims funds from Chain A
  const claimOnChainA = async () => {
    const tx = await contractChainAWithSigner.claim(swapId, secret);
    await tx.wait();
    setSwapState("Claimed on Chain A");
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
      console.log("ContractChainA:", contractChainA);
      console.log("contractChainA runner:", contractChainA.runner);
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
          if (swapDetails.recipient.toLowerCase() === account.toLowerCase()) {
            setHashedSecret(swapDetails.hashedSecret);
            setSwapState("Initiated on Chain A");
          }
        }
      } catch (error) {
        console.error("Error checking SwapInitiated on Chain A:", error);
      }

      console.log("ContractChainB:", contractChainB);
      console.log("contractChainB runner:", contractChainB.runner);
      const latestBlockB = await contractChainB.runner.getBlockNumber();
      console.log("Latest Block B Number:", latestBlockB);
      const fromBlockB = Math.max(latestBlockB - 1000, 0);

      console.log("Fetching past events for swapId:", currentSwapId);
      try {
        const claimedBFilter =
          contractChainB.filters.SwapClaimed(currentSwapId);
        const claimedBEvents = await contractChainB.queryFilter(
          claimedBFilter,
          fromBlockB,
          latestBlockB,
        );
        if (claimedBEvents.length > 0) {
          console.log(
            "Found past SwapClaimed event on Chain B:",
            claimedBEvents[0],
          );
          setSecret(claimedBEvents[0].args.secret);
          setSwapState("Claimed on Chain B");
          const swapDetailsB = await contractChainB.swaps(currentSwapId);
          setHashedSecret(swapDetailsB.hashedSecret);
          return; // Stop checking further
        }
      } catch (error) {
        console.error("Error checking SwapClaimed on Chain B:", error);
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
            <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm">
              Taker
            </span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">Your Role</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">{swapState}</span>
        </div>
      </div>

      {swapState === "Not Started" && (
        <div className="glass-dark rounded-lg p-4 border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center space-x-2 text-yellow-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              Waiting for Maker to initiate the swap on {CHAIN_A_CONFIG.name}...
            </span>
          </div>
        </div>
      )}

      {hashedSecret && (
        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm font-medium">
              Hashed Secret
            </span>
          </div>
          <p className="text-gray-400 text-xs font-mono break-all">
            {hashedSecret}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="glass-dark rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white font-medium">
                Step 1: Initiate Swap on {CHAIN_B_CONFIG.name}
              </span>
            </div>
          </div>
          <button
            onClick={initiateOnChainB}
            disabled={swapState !== "Initiated on Chain A"}
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
                Step 2: Claim from {CHAIN_A_CONFIG.name}
              </span>
            </div>
          </div>
          {secret && (
            <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-300 text-xs font-semibold mb-1 flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>Revealed Secret</span>
              </p>
              <p className="text-gray-300 text-xs font-mono break-all">
                {secret}
              </p>
            </div>
          )}
          <button
            onClick={claimOnChainA}
            disabled={swapState !== "Claimed on Chain B"}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2"
          >
            <Gift className="w-4 h-4" />
            <span>Claim Tokens</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakerView;
