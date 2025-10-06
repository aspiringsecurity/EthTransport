import { useState } from 'react';
import { Wallet, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Hash, Clock, User, FileText, Shield } from 'lucide-react';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

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

interface ContractSubmissionStepProps {
  pdfCID: string;
  onNext: (contractData: any) => void;
  onBack: () => void;
}

export default function ContractSubmissionStep({ pdfCID, onNext, onBack }: ContractSubmissionStepProps) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [contractData, setContractData] = useState<any>(null);

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
      console.error('Wallet connection error:', error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmitToContract = async () => {
    if (!contract) {
      alert("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    try {
      const tx = await contract.reportIncident(pdfCID);
      const receipt = await tx.wait();

      const incidentData = {
        id: receipt.logs[0].args[0].toString(),
        description: receipt.logs[0].args[1],
        reportedBy: receipt.logs[0].args[2],
        timestamp: new Date(Number(receipt.logs[0].args[3]) * 1000).toLocaleString(),
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };

      setContractData(incidentData);
      setSubmissionComplete(true);
    } catch (error: any) {
      console.error('Contract submission error:', error);
      alert("Transaction failed: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (contractData) {
      onNext(contractData);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit to Blockchain</h2>
        <p className="text-gray-600">
          Record your incident report on the blockchain for permanent, tamper-proof storage
        </p>
      </div>

      {/* Contract Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Smart Contract Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Contract Address:</span>
            <code className="bg-white px-2 py-1 rounded border text-xs font-mono">
              {contractAddress}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">IPFS URL:</span>
            <code className="bg-white px-2 py-1 rounded border text-xs font-mono max-w-xs truncate">
              {pdfCID}
            </code>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      {!walletAddress ? (
        <div className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Wallet Required</span>
            </div>
            <p className="text-sm text-yellow-700">
              Connect your wallet to submit the incident report to the blockchain
            </p>
          </div>

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-indigo-300 flex items-center justify-center space-x-2 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      ) : !submissionComplete ? (
        <div className="space-y-6">
          {/* Connected Wallet */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Wallet Connected</p>
                <p className="text-sm text-green-700 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmitToContract}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-red-300 flex items-center justify-center space-x-2 mx-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Transaction...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Submit to Blockchain</span>
                </>
              )}
            </button>
          </div>

          {/* Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">About Blockchain Submission</p>
                <p>This transaction will permanently record your incident report's IPFS hash on the blockchain, providing cryptographic proof of when and by whom the report was submitted.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Successfully Submitted!</h3>
              <p className="text-green-800 mb-4">
                Your incident report has been permanently recorded on the blockchain.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700">Incident ID</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">#{contractData.id}</span>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700">Timestamp</span>
                  </div>
                  <span className="text-sm text-gray-900">{contractData.timestamp}</span>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700">Reporter</span>
                  </div>
                  <span className="text-sm font-mono text-gray-900">
                    {contractData.reportedBy.slice(0, 6)}...{contractData.reportedBy.slice(-4)}
                  </span>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700">Block Number</span>
                  </div>
                  <span className="text-sm text-gray-900">{contractData.blockNumber}</span>
                </div>
              </div>
              
              <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                <span className="font-medium text-gray-700">Transaction Hash:</span>
                <div className="mt-1">
                  <code className="text-xs text-gray-900 bg-gray-50 px-2 py-1 rounded break-all font-mono">
                    {contractData.txHash}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        {submissionComplete && (
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center space-x-2"
          >
            <span>View Summary</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}