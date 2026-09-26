import React from "react";
import { ChevronRight } from "lucide-react";

const OngoingSwapCard = ({ auction, account, onClick }) => {
  const isMaker = account.toLowerCase() === auction[0].toLowerCase();

  return (
    <div
      onClick={onClick}
      className="glass rounded-xl p-6 card-hover border border-white/10 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold">
              #{auction.id}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isMaker
                  ? "bg-green-500/20 border border-green-500/30 text-green-300"
                  : "bg-orange-500/20 border border-orange-500/30 text-orange-300"
              }`}
            >
              {isMaker ? "🔧 Maker" : "🎯 Taker"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Maker</p>
              <p className="text-gray-300 font-mono text-xs">
                {auction[0].substring(0, 10)}...
                {auction[0].substring(auction[0].length - 8)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Taker</p>
              <p className="text-gray-300 font-mono text-xs">
                {auction[6].substring(0, 10)}...
                {auction[6].substring(auction[6].length - 8)}
              </p>
            </div>
          </div>
        </div>

        <div className="ml-4">
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default OngoingSwapCard;
