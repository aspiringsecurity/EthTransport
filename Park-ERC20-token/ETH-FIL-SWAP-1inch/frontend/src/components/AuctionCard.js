import React from "react";
import { ethers, formatEther } from "ethers";
import { TrendingUp } from "lucide-react";

const AuctionCard = ({ auction, bid, endAuction }) => {
  return (
    <div className="glass rounded-xl p-6 card-hover border border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold">
              #{auction.id}
            </span>
            <span className="text-xs text-gray-400">
              Ends {new Date(Number(auction[5]) * 1000).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="glass-dark rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Selling</p>
              <p className="text-white font-semibold text-lg">
                {formatEther(auction[2])}
              </p>
              <p className="text-purple-400 text-xs truncate">{auction[1]}</p>
            </div>

            <div className="glass-dark rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Minimum Buying</p>
              <p className="text-white font-semibold text-lg">
                {formatEther(auction[4])}
              </p>
              <p className="text-pink-400 text-xs truncate">{auction[3]}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center text-xs">
              <span className="text-gray-400 mr-2">Maker:</span>
              <span className="text-gray-300 font-mono">
                {auction[0].substring(0, 10)}...
                {auction[0].substring(auction[0].length - 8)}
              </span>
            </div>
            {auction[6] !== ethers.ZeroAddress && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Highest Bidder:</span>
                  <span className="text-gray-300 font-mono">
                    {auction[6].substring(0, 10)}...
                    {auction[6].substring(auction[6].length - 8)}
                  </span>
                </div>
                <span className="text-green-400 font-semibold">
                  {formatEther(auction[7])}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-3 lg:w-64">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              bid(auction.id, e.target.elements.bidAmount.value);
            }}
            className="space-y-2"
          >
            <input
              type="text"
              name="bidAmount"
              placeholder="Enter your bid"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
            />
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-200 text-sm"
            >
              Place Bid
            </button>
          </form>
          <button
            onClick={() => endAuction(auction.id)}
            className="w-full py-2.5 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 transition-all duration-200 font-medium text-sm"
          >
            End Auction
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
