declare global {
    interface Window {
        ethereum?: any;
    }
}

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Shield, Wallet, Search, FileText, CheckCircle, AlertCircle, Clock, User, Hash } from 'lucide-react';

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
const contractAddress = "0xf12eAD27305b91A03AFBb413A2eD2F028e4C9E6b";

export default function ContractHandler({ pdfCID }: { pdfCID: string }) {
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [cid, setCid] = useState('');
    const [incidentId, setIncidentId] = useState('');
    const [fetchedIncident, setFetchedIncident] = useState<any>(null);
    const [reportedIncident, setReportedIncident] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [activeTab, setActiveTab] = useState<'report' | 'search'>('report');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (reportedIncident) {
            setShowSuccess(true);
            console.log(showSuccess);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [reportedIncident]);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask");
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

    const handleReportIncident = async () => {
        if (!contract) return alert("Connect wallet first");
        if (pdfCID === "https://w3s.link/ipfs/") return alert("Upload the incident report first");

        setIsLoading(true);
        try {
            const tx = await contract.reportIncident(pdfCID);
            const receipt = await tx.wait();

            const incidentData = {
                id: receipt.logs[0].args[0].toString(),
                description: receipt.logs[0].args[1],
                reportedBy: receipt.logs[0].args[2],
                timestamp: new Date(Number(receipt.logs[0].args[3]) * 1000).toLocaleString(),
                txHash: tx.hash
            };

            setReportedIncident(incidentData);
            setCid('');
            console.log(cid);
        } catch (error: any) {
            alert("Error reporting incident: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex flex-col items-center justify-center mb-4">
                            <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-2" />
                            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
                                SecureReport
                            </h1>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-lg mb-3">
                            Decentralized Incident Reporting on Filecoin
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-xs text-gray-500">Powered by</span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                Filecoin Network
                            </span>
                        </div>
                    </div>

                    {/* Wallet Connection Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-blue-100 mb-8 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3" />
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    Wallet Connection
                                </h2>
                            </div>
                            {!walletAddress ? (
                                <button
                                    onClick={connectWallet}
                                    disabled={isConnecting}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    {isConnecting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="w-4 h-4" />
                                            <span>Connect Wallet</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                    <span className="text-green-800 font-medium">
                                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                        <div className="flex flex-col sm:flex-row border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('report')}
                                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${activeTab === 'report'
                                        ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Report Incident</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('search')}
                                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${activeTab === 'search'
                                        ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Search Incident</span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {/* Report Tab */}
                            {activeTab === 'report' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <Hash className="w-5 h-5 text-blue-600 mr-2" />
                                            <span className="font-medium text-blue-800">IPFS CID</span>
                                        </div>
                                        <code className="text-sm text-blue-700 bg-white px-3 py-1 rounded border break-all">
                                            {pdfCID || 'No file uploaded'}
                                        </code>
                                    </div>

                                    <button
                                        onClick={handleReportIncident}
                                        disabled={isLoading || !contract || !pdfCID || pdfCID === "https://w3s.link/ipfs/"}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-5 h-5" />
                                                <span>Submit Incident Report</span>
                                            </>
                                        )}
                                    </button>

                                    {reportedIncident && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                            <div className="flex items-center mb-4">
                                                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-green-800">Incident Successfully Reported</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center">
                                                    <Hash className="w-4 h-4 text-green-600 mr-2" />
                                                    <span className="font-medium text-green-700">ID:</span>
                                                    <span className="ml-1 text-green-800">#{reportedIncident.id}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 text-green-600 mr-2" />
                                                    <span className="font-medium text-green-700">Time:</span>
                                                    <span className="ml-1 text-green-800">{reportedIncident.timestamp}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 text-green-600 mr-2" />
                                                    <span className="font-medium text-green-700">Reporter:</span>
                                                    <span className="ml-1 text-green-800 font-mono text-xs">
                                                        {reportedIncident.reportedBy.slice(0, 6)}...{reportedIncident.reportedBy.slice(-4)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FileText className="w-4 h-4 text-green-600 mr-2" />
                                                    <span className="font-medium text-green-700">CID:</span>
                                                    <span className="ml-1 text-green-800 font-mono text-xs truncate">
                                                        {reportedIncident.description.slice(0, 20)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Search Tab */}
                            {activeTab === 'search' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Incident ID
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter incident ID (e.g., 1)"
                                            value={incidentId}
                                            onChange={(e) => setIncidentId(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={handleFetchIncident}
                                        disabled={isLoading || !contract || !incidentId.trim()}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Fetching...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                <span>Fetch Incident Details</span>
                                            </>
                                        )}
                                    </button>

                                    {fetchedIncident && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                            <div className="flex items-center mb-4">
                                                <FileText className="w-6 h-6 text-blue-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-blue-800">Incident Details</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center">
                                                    <Hash className="w-4 h-4 text-blue-600 mr-2" />
                                                    <span className="font-medium text-blue-700">ID:</span>
                                                    <span className="ml-1 text-blue-800">#{fetchedIncident[0].toString()}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                                                    <span className="font-medium text-blue-700">Time:</span>
                                                    <span className="ml-1 text-blue-800">
                                                        {new Date(Number(fetchedIncident[3]) * 1000).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 text-blue-600 mr-2" />
                                                    <span className="font-medium text-blue-700">Reporter:</span>
                                                    <span className="ml-1 text-blue-800 font-mono text-xs">
                                                        {fetchedIncident[2].slice(0, 6)}...{fetchedIncident[2].slice(-4)}
                                                    </span>
                                                </div>
                                                <div className="col-span-full">
                                                    <div className="flex items-start">
                                                        <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                                                        <div>
                                                            <span className="font-medium text-blue-700">CID:</span>
                                                            <div className="ml-1 text-blue-800 font-mono text-xs break-all bg-white p-2 rounded border mt-1">
                                                                <a
                                                                    href={fetchedIncident[1]}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="underline text-blue-800"
                                                                >
                                                                    {fetchedIncident[1]}
                                                                </a>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Icon Grid */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                                <p className="text-sm sm:text-base md:text-lg">Shield Icon</p>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center">
                                <Wallet className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                                <p className="text-sm sm:text-base md:text-lg">Wallet Icon</p>
                            </div>
                            {/* Add more icons or elements as needed */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}