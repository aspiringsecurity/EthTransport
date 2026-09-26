import React from "react";
import { Sparkles, Info, Plus } from "lucide-react";

const CreateAuctionForm = ({ form, handleInputChange, createAuction }) => {
  return (
    <div className="glass rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl card-hover">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Swap Auction</h2>
      </div>

      <form onSubmit={createAuction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token to Sell <span className="text-purple-400">(Sepolia)</span>
            </label>
            <input
              type="text"
              name="tokenA"
              placeholder="0x..."
              onChange={handleInputChange}
              value={form.tokenA}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <p className="mt-1.5 text-xs text-gray-400 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Escrowed on Sepolia network
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Sell
            </label>
            <input
              type="text"
              name="amountA"
              placeholder="1.0"
              onChange={handleInputChange}
              value={form.amountA}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token to Buy <span className="text-pink-400">(Filecoin)</span>
            </label>
            <input
              type="text"
              name="tokenB"
              placeholder="0x..."
              onChange={handleInputChange}
              value={form.tokenB}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <p className="mt-1.5 text-xs text-gray-400 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Escrowed on Filecoin Calibration network
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Amount to Buy
            </label>
            <input
              type="text"
              name="minAmountB"
              placeholder="0.5"
              onChange={handleInputChange}
              value={form.minAmountB}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Auction Duration (seconds)
          </label>
          <input
            type="text"
            name="duration"
            placeholder="3600 (1 hour)"
            onChange={handleInputChange}
            value={form.duration}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Auction</span>
        </button>
      </form>
    </div>
  );
};

export default CreateAuctionForm;
