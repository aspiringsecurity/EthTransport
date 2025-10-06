import { CheckCircle, Download, ExternalLink, RotateCcw, Calendar, MapPin, FileText, Hash, Cloud, Shield, Copy } from 'lucide-react';
import type { WizardData } from '../IncidentWizard';

interface SuccessSummaryStepProps {
  wizardData: WizardData;
  onRestart: () => void;
  onBackToHome?: () => void;
}

export default function SuccessSummaryStep({ wizardData, onRestart, onBackToHome }: SuccessSummaryStepProps) {
  const { incidentData, pdfBytes, storachaCID, contractData } = wizardData;

  const handleDownloadPDF = () => {
    if (!pdfBytes) return;

    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'incident_report.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Report Successfully Submitted!</h2>
        <p className="text-gray-600 text-lg">
          Your incident report has been processed and stored securely across multiple systems
        </p>
      </div>

      {/* Process Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900">PDF Generated</span>
          </div>
          <p className="text-sm text-gray-600">Professional report created with all incident details</p>
        </div>

        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Cloud className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-semibold text-gray-900">Stored on IPFS</span>
          </div>
          <p className="text-sm text-gray-600">Permanently stored on decentralized network</p>
        </div>

        <div className="bg-white border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-900">Blockchain Verified</span>
          </div>
          <p className="text-sm text-gray-600">Immutably recorded on blockchain</p>
        </div>
      </div>

      {/* Incident Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Location</span>
                <p className="text-gray-900">{incidentData.location}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Reported</span>
                <p className="text-gray-900">{contractData?.timestamp || 'Just now'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Description</span>
                <p className="text-gray-900 text-sm">{incidentData.description}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Incident ID</span>
                <p className="text-gray-900 font-bold">#{contractData?.id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="space-y-4 mb-8">
        {/* IPFS Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Decentralized Storage (IPFS)</h4>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Permanent
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Content ID (CID):</span>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                  {storachaCID ? `${storachaCID.substring(0, 20)}...` : 'N/A'}
                </code>
                {storachaCID && (
                  <button 
                    onClick={() => copyToClipboard(storachaCID)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {storachaCID && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Access URL:</span>
                <a 
                  href={`https://w3s.link/ipfs/${storachaCID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span className="text-xs">View on IPFS</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Blockchain Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Blockchain Record</h4>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Verified
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Transaction Hash:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                  {contractData?.txHash ? `${contractData.txHash.substring(0, 20)}...` : 'N/A'}
                </code>
                {contractData?.txHash && (
                  <button 
                    onClick={() => copyToClipboard(contractData.txHash)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Block Number:</span>
              <span className="text-gray-900">{contractData?.blockNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Download PDF Report</span>
        </button>
        
        <button
          onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Report Another Incident</span>
        </button>

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-green-300 flex items-center justify-center space-x-2"
          >
            <span>Back to Home</span>
          </button>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Your Report is Secure</p>
            <p>This incident report is now permanently stored across decentralized networks and recorded on the blockchain, ensuring it cannot be lost, tampered with, or censored.</p>
          </div>
        </div>
      </div>
    </div>
  );
}