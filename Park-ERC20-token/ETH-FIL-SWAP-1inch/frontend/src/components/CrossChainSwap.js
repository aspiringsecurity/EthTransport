import React, { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import escrowABI from "../Escrow.json";
import MakerView from "./MakerView";
import TakerView from "./TakerView";
import { ArrowLeft, Loader2, AlertCircle, ArrowLeftRight } from "lucide-react";

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

const CrossChainSwap = ({ auction, provider, signer, account }) => {
  const [userRole, setUserRole] = useState(null); // 'maker' or 'taker'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [makerSwapState, setMakerSwapState] = useState("Not Started");
  const [takerSwapState, setTakerSwapState] = useState("Not Started");
  const [swapCompletionStatus, setSwapCompletionStatus] = useState("");

  // Setup providers and contracts for both chains
  const {
    contractChainA,
    contractChainB,
    contractChainAWithSigner,
    contractChainBWithSigner,
  } = useMemo(() => {
    // Read-only providers for fetching data from either chain, regardless of wallet connection
    const provA = new ethers.JsonRpcProvider(CHAIN_A_CONFIG.rpcUrl);
    const provB = new ethers.JsonRpcProvider(CHAIN_B_CONFIG.rpcUrl);

    // Read-only contract instances
    const conA = new ethers.Contract(
      CHAIN_A_CONFIG.escrowAddress,
      escrowABI.abi,
      provA,
    );
    const conB = new ethers.Contract(
      CHAIN_B_CONFIG.escrowAddress,
      escrowABI.abi,
      provB,
    );

    let conAWithSigner = null;
    let conBWithSigner = null;
    if (signer) {
      // The signer from the wallet is connected to the currently active network.
      // We create contract instances for writing, connected to this signer.
      // The user must be on the correct network for these to work.
      conAWithSigner = new ethers.Contract(
        CHAIN_A_CONFIG.escrowAddress,
        escrowABI.abi,
        signer,
      );
      conBWithSigner = new ethers.Contract(
        CHAIN_B_CONFIG.escrowAddress,
        escrowABI.abi,
        signer,
      );
    }

    return {
      contractChainA: conA, // Read-only instance for Chain A
      contractChainB: conB, // Read-only instance for Chain B
      contractChainAWithSigner: conAWithSigner, // Write instance for Chain A
      contractChainBWithSigner: conBWithSigner, // Write instance for Chain B
    };
  }, [signer]);

  // Determine user role
  useEffect(() => {
    if (account) {
      if (account.toLowerCase() === auction.maker.toLowerCase()) {
        setUserRole("maker");
      } else if (
        account.toLowerCase() === auction.highestBidder.toLowerCase()
      ) {
        setUserRole("taker");
      }
    }
    console.log("Account:", account);
    console.log("Auction Maker:", auction.maker);
    console.log("Auction Taker:", auction.highestBidder);
    console.log("User Role:", userRole);
  }, [account, auction]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <ArrowLeftRight className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Cross-Chain Swap for Auction #{auction.id}
          </h2>
        </div>

        {error && (
          <div className="mb-6 glass-dark rounded-lg p-4 border border-red-500/30 bg-red-500/10">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mb-6 flex items-center justify-center space-x-2 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        )}

        <div className="glass-dark rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Swap Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">
                Maker ({CHAIN_A_CONFIG.name})
              </span>
              <span className="text-gray-300 font-mono text-sm">
                {auction.maker.substring(0, 10)}...
                {auction.maker.substring(auction.maker.length - 8)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">
                Taker ({CHAIN_B_CONFIG.name})
              </span>
              <span className="text-gray-300 font-mono text-sm">
                {auction.highestBidder.substring(0, 10)}...
                {auction.highestBidder.substring(
                  auction.highestBidder.length - 8,
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">Maker's Tokens</span>
              <span className="text-white font-semibold">
                {ethers.formatEther(auction.amountA)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Taker's Tokens</span>
              <span className="text-white font-semibold">
                {ethers.formatEther(auction.highestBid)}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
          {!userRole && (
            <div className="text-gray-400 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to wallet to determine your role...</span>
            </div>
          )}
          {userRole === "maker" && (
            <MakerView
              auction={auction}
              contractChainAWithSigner={contractChainAWithSigner}
              contractChainB={contractChainB}
              contractChainA={contractChainA}
              contractChainBWithSigner={contractChainBWithSigner}
              account={account}
              signer={signer}
            />
          )}
          {userRole === "taker" && (
            <TakerView
              auction={auction}
              contractChainA={contractChainA}
              contractChainB={contractChainB}
              contractChainAWithSigner={contractChainAWithSigner}
              contractChainBWithSigner={contractChainBWithSigner}
              account={account}
              signer={signer}
            />
          )}
          {userRole && userRole !== "maker" && userRole !== "taker" && (
            <p className="text-gray-400">
              You are not a participant in this swap.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossChainSwap;
