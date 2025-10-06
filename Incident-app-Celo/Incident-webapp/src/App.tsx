declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Shield, Zap, AlertTriangle, Search, User, Clock, Hash, FileText, Wallet, Activity, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

// Contract ABI 
const abi: any[] = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "reportedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "IncidentReported",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getIncident",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "incidentCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "incidents",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "reportedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "reportIncident",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


const contractAddress = "0x3ab0dCEF4F1A3d005B68F2527F96C47FAb656BAC";

function App() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [description, setDescription] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [fetchedIncident, setFetchedIncident] = useState<any>(null);
  const [reportedIncident, setReportedIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'search'>('report');

  // Animation states
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (reportedIncident) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [reportedIncident]);

  // important functions
  //
  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue");
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      setContract(contract);
      setWalletAddress(accounts[0]);
    } catch (error) {
      alert("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Report Incident
  const handleReportIncident = async (): Promise<void> => {
    if (!contract) return alert("Connect wallet first");
    if (!description.trim()) return alert("Please enter a description");

    setIsLoading(true);
    try {
      const tx = await contract.reportIncident(description);

      
      const receipt = await tx.wait();

      // Extracting event data from the receipt
      const incidentData = {
        id: receipt.logs[0].args[0].toString(),
        description: receipt.logs[0].args[1],
        reportedBy: receipt.logs[0].args[2],
        timestamp: new Date(Number(receipt.logs[0].args[3]) * 1000).toLocaleString(),
        txHash: tx.hash
      };

      setReportedIncident(incidentData);
      setDescription('');

    } catch (error: any) {
      console.error("Error reporting incident:", error);
      alert("Error reporting incident: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get Incident by ID
  const handleFetchIncident = async () => {
    if (!contract) return alert("Connect wallet first");
    if (!incidentId) return alert("Please enter an incident ID");

    setIsLoading(true);
    try {
      const data = await contract.getIncident(Number(incidentId));
      setFetchedIncident(data);
    } catch (err) {
      alert("Error fetching incident - ID may not exist");
    } finally {
      setIsLoading(false);
    }
  };

  ////

  //frontend

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-bounce delay-1000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <Shield className="relative text-white w-16 h-16 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            SecureReport
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Decentralized incident reporting system powered by blockchain technology.
            Report, track, and verify incidents with complete transparency.
          </p>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Wallet className="w-6 h-6" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
        </div>

        {/* Success Animation */}
        {showSuccess && reportedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-8 rounded-3xl shadow-2xl transform animate-bounce">
              <div className="text-center text-white">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Incident Reported!</h3>
                <p className="text-green-100">ID: #{reportedIncident.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'report'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <AlertTriangle className="w-5 h-5" />
                Report Incident
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'search'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Search className="w-5 h-5" />
                Search Incident
              </button>
            </div>
          </div>

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Report New Incident</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Incident Description
                  </label>
                  <div className="relative">
                    <textarea
                      rows={6}
                      className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-300"
                      placeholder="Provide a detailed description of the incident. Include what happened, when it occurred, and any relevant details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {description.length}/1000
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReportIncident}
                  disabled={isLoading || !contract || !description.trim()}
                  className="group w-full relative px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-orange-500/25 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <Activity className="w-6 h-6 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6" />
                        Submit Incident Report
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Recent Report Display */}
              {reportedIncident && !showSuccess && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-green-400">Successfully Reported</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Hash className="w-4 h-4 text-green-400" />
                      <span className="font-medium">ID:</span>
                      <span className="font-mono text-green-400">#{reportedIncident.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="font-medium">Time:</span>
                      <span className="text-green-400">{reportedIncident.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 md:col-span-2">
                      <User className="w-4 h-4 text-green-400" />
                      <span className="font-medium">Reporter:</span>
                      <span className="font-mono text-green-400">{reportedIncident.reportedBy}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Search Incidents</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Incident ID
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      className="flex-1 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter incident ID (e.g., 1, 2, 3...)"
                      value={incidentId}
                      onChange={(e) => setIncidentId(e.target.value)}
                    />
                    <button
                      onClick={handleFetchIncident}
                      disabled={isLoading || !contract || !incidentId.trim()}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <Activity className="w-6 h-6 animate-spin" />
                      ) : (
                        <Search className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>

                {fetchedIncident && (
                  <div className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-400">Incident Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Hash className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">ID:</span>
                        <span className="font-mono text-blue-400">#{fetchedIncident[0].toString()}</span>
                      </div>
                      <div className="text-gray-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">Description:</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-white leading-relaxed">{fetchedIncident[1]}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">Reporter:</span>
                          <span className="font-mono text-blue-400 text-sm">{fetchedIncident[2]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">Time:</span>
                          <span className="text-blue-400">{new Date(Number(fetchedIncident[3]) * 1000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400">
          <p className="text-sm">
            Powered by Ethereum Blockchain • Secure • Transparent • Immutable
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;