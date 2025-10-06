import { useState } from 'react';
import { Search, ArrowLeft, FileText, User, Clock, Hash, ExternalLink, AlertCircle, Loader } from 'lucide-react';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

const abi: any[] = [
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
    }
];

const contractAddress = "0xf12eAD27305b91A03AFBb413A2eD2F028e4C9E6b";

interface IncidentSearchPageProps {
  onBack: () => void;
}

export default function IncidentSearchPage({ onBack }: IncidentSearchPageProps) {
  const [incidentId, setIncidentId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [incidentData, setIncidentData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!incidentId.trim()) {
      setError('Please enter an incident ID');
      return;
    }

    if (!window.ethereum) {
      setError('Please install MetaMask to search incidents');
      return;
    }

    setIsSearching(true);
    setError('');
    setIncidentData(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, browserProvider);
      
      const data = await contract.getIncident(Number(incidentId));
      
      if (data[0].toString() === '0') {
        setError('Incident not found. Please check the ID and try again.');
        return;
      }

      const formattedData = {
        id: data[0].toString(),
        description: data[1],
        reportedBy: data[2],
        timestamp: new Date(Number(data[3]) * 1000).toLocaleString(),
        ipfsUrl: data[1] // The description field contains the IPFS URL
      };

      setIncidentData(formattedData);
    } catch (err: any) {
      console.error('Search error:', err);
      if (err.message.includes('execution reverted')) {
        setError('Incident not found. Please check the ID and try again.');
      } else {
        setError('Failed to search incident. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncidentId(e.target.value);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Search Incident
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Incident Details</h2>
            <p className="text-gray-600">
              Enter the incident ID to retrieve all details from the blockchain
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-md mx-auto mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Incident ID
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={incidentId}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
                placeholder="Enter incident ID (e.g., 1, 2, 3...)"
                min="1"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center space-x-2"
              >
                {isSearching ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{isSearching ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 text-sm font-medium">{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center">
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">How to find your incident ID:</p>
                  <p>The incident ID is provided when you submit a new report. It's a unique number assigned to each incident.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {incidentData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Incident Details</h3>
              <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Incident ID</span>
                    <p className="text-2xl font-bold text-gray-900">#{incidentData.id}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Reported On</span>
                    <p className="text-gray-900">{incidentData.timestamp}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Reported By</span>
                    <p className="text-gray-900 font-mono text-sm">
                      {incidentData.reportedBy.slice(0, 6)}...{incidentData.reportedBy.slice(-4)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Report Status</span>
                    <p className="text-green-600 font-semibold">Verified on Blockchain</p>
                  </div>
                </div>
              </div>
            </div>

            {/* IPFS Link */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Stored Report (IPFS)</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Decentralized
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-900 break-all pr-4">
                    {incidentData.ipfsUrl}
                  </code>
                  <a
                    href={incidentData.ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                  >
                    <span>View Report</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div className="text-sm text-green-800">
                  <p className="font-medium">Verified Incident Report</p>
                  <p>This incident has been permanently recorded on the blockchain and stored on IPFS, ensuring its authenticity and immutability.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}