import React, { useState, useEffect } from "react";
import { ethers, parseEther } from "ethers";
import contractAddress from "../SwapAuction.json";
import CrossChainSwap from "./CrossChainSwap";
import CreateAuctionForm from "./CreateAuctionForm";
import AuctionCard from "./AuctionCard";
import OngoingSwapCard from "./OngoingSwapCard";
import EmptyState from "./EmptyState";
import { Flame, Zap, Package, ArrowLeftRight } from "lucide-react";

const CONTRACTADDRESS = "0xF7015cC82A0980152521fc3B31A5bb267A625f35";

const Swap = ({ account, network }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const [form, setForm] = useState({
    tokenA: "",
    amountA: "1",
    tokenB: "",
    minAmountB: "1",
    duration: "",
  });

  useEffect(() => {
    const init = async () => {
      if (account) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        setSigner(signer);
        console.log("Signer set:", signer);
        const contract = new ethers.Contract(
          CONTRACTADDRESS,
          contractAddress.abi,
          signer,
        );
        setContract(contract);
        console.log("Contract set:", contract);
        console.log("account:", account);
        await loadAuctions();
      }
    };
    init();
  }, [account]);

  const loadAuctions = async () => {
    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com",
    );
    const general_contract = new ethers.Contract(
      CONTRACTADDRESS,
      contractAddress.abi,
      provider,
    );
    const auctionCounter = await general_contract.auctionCounter();
    let active = [];
    let ended = [];
    console.log("Total Auctions:", auctionCounter.toString());
    for (let i = 1; i <= auctionCounter; i++) {
      const auction = await general_contract.auctions(i);
      if (auction.ended) {
        ended.push({ id: i, ...auction });
      } else {
        active.push({ id: i, ...auction });
      }
    }
    console.log("Active Auctions:", active);
    console.log("Ended Auctions:", ended);
    setAuctions(active);
    setEndedAuctions(ended);
  };

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createAuction = async (e) => {
    e.preventDefault();
    if (contract) {
      try {
        console.log("create Auction");
        console.log("form", form);
        const tx = await contract.createAuction(
          form.tokenA,
          parseEther(form.amountA.toString()),
          form.tokenB,
          parseEther(form.minAmountB.toString()),
          form.duration,
        );
        await tx.wait();
        console.log(tx);
        await loadAuctions();
      } catch (error) {
        console.error("Error creating auction:", error);
      }
    }
  };

  const bid = async (auctionId, amount) => {
    if (contract) {
      try {
        const tx = await contract.bid(auctionId, parseEther(amount));
        await tx.wait();
        loadAuctions();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const endAuction = async (auctionId) => {
    if (contract) {
      try {
        const tx = await contract.endAuction(auctionId);
        await tx.wait();
        loadAuctions();
      } catch (error) {
        console.error("Error ending auction:", error);
      }
    }
  };

  const handleSelectAuction = (auction) => {
    console.log("Rendering CrossChainSwap for selected auction:", auction);
    setSelectedAuction({
      id: auction.id,
      maker: auction[0],
      tokenA: auction[1],
      amountA: auction[2],
      tokenB: auction[3],
      minAmountB: auction[4],
      endTime: auction[5],
      highestBidder: auction[6],
      highestBid: auction[7],
      ended: auction[8],
    });
  };

  // Filter ongoing swaps for current user
  const userOngoingSwaps = endedAuctions.filter((auction) => {
    return (
      account &&
      (account.toLowerCase() === auction[0].toLowerCase() ||
        account.toLowerCase() === auction[6].toLowerCase())
    );
  });

  if (selectedAuction) {
    console.log("Account:", account);
    return (
      <CrossChainSwap
        auction={selectedAuction}
        provider={provider}
        signer={signer}
        account={account}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CreateAuctionForm
        form={form}
        handleInputChange={handleInputChange}
        createAuction={createAuction}
      />

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Active Auctions</h2>
        </div>
        <div className="space-y-4">
          {auctions.length === 0 ? (
            <EmptyState
              icon={<Package className="w-16 h-16 mx-auto mb-3 opacity-50" />}
              title="No active auctions"
              description="Create the first auction above"
            />
          ) : (
            auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                bid={bid}
                endAuction={endAuction}
              />
            ))
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Ongoing Swaps</h2>
        </div>
        <div className="space-y-4">
          {userOngoingSwaps.length === 0 ? (
            <EmptyState
              icon={
                <ArrowLeftRight className="w-16 h-16 mx-auto mb-3 opacity-50" />
              }
              title="No ongoing swaps"
              description="Your active swaps will appear here"
            />
          ) : (
            userOngoingSwaps.map((auction) => (
              <OngoingSwapCard
                key={auction.id}
                auction={auction}
                account={account}
                onClick={() => handleSelectAuction(auction)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Swap;
