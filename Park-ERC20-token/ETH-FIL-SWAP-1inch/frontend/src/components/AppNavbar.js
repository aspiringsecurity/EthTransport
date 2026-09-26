import React from "react";

const AppNavbar = ({ account, network, connectWallet, disconnectWallet }) => {
  return (
    <nav className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                ⚡ ETH-FIL Swap
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {account ? (
              <>
                <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Connected</span>
                    <span className="text-sm font-medium text-white">
                      {account.substring(0, 6)}...
                      {account.substring(account.length - 4)}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-gray-300">{network}</span>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 transition-all duration-200 font-medium text-sm"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-200 transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
