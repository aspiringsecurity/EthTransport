import { useState } from 'react';
import { Cloud, ArrowLeft, ArrowRight, CheckCircle, Upload, Hash } from 'lucide-react';
import { create } from '@web3-storage/w3up-client';
import StorachaConnection from '../StorachaConnection';
import type { StorachaCredentials } from '../StorachaConnection';

interface StorageUploadStepProps {
  pdfBytes: Uint8Array;
  onNext: (cid: string) => void;
  onBack: () => void;
}

export default function StorageUploadStep({ pdfBytes, onNext, onBack }: StorageUploadStepProps) {
  const [uploadHash, setUploadHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [storachaCredentials, setStorachaCredentials] = useState<StorachaCredentials | null>(null);
  const [isStorachaConnected, setIsStorachaConnected] = useState(false);

  const handleStorachaConnect = (credentials: StorachaCredentials) => {
    if (credentials.email && credentials.spaceDID) {
      setStorachaCredentials(credentials);
      setIsStorachaConnected(true);
    } else {
      setStorachaCredentials(null);
      setIsStorachaConnected(false);
    }
  };

  const handleUpload = async () => {
    if (!storachaCredentials) {
      alert('Please connect your Storacha account first.');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const pdfFile = new File([new Uint8Array(pdfBytes)], 'incident_report.pdf', {
        type: 'application/pdf',
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const client = await create();
      await client.login(storachaCredentials.email as `${string}@${string}`);
      await client.setCurrentSpace(storachaCredentials.spaceDID as `did:${string}:${string}`);

      const cid = await client.uploadFile(pdfFile);
      const url = `https://w3s.link/ipfs/${cid}`;

      clearInterval(progressInterval);
      setProgress(100);

      console.log('Uploaded to Storacha:', url);
      console.log('CID:', cid.toString());

      setUploadHash(cid.toString());
      setUploadComplete(true);
    } catch (error) {
      console.error('Storacha upload error:', error);
      alert('Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = () => {
    if (uploadHash) {
      onNext(uploadHash);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Cloud className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload to Decentralized Storage</h2>
        <p className="text-gray-600">
          Secure your incident report on the Filecoin network via Web3.Storage (Storacha)
        </p>
      </div>

      {/* File Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Hash className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">incident_report.pdf</h3>
            <p className="text-sm text-gray-500">
              {(pdfBytes.length / 1024).toFixed(1)} KB • Ready for upload
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Generated
            </span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="space-y-6">
        {/* Storacha Connection */}
        <StorachaConnection
          onConnect={handleStorachaConnect}
          isConnected={isStorachaConnected}
          credentials={storachaCredentials || undefined}
        />

        {isStorachaConnected && !uploadComplete && (
          <div>
            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Uploading to Storacha...</span>
                  </div>
                  <span className="text-sm font-medium text-blue-700">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  {progress < 30 
                    ? 'Initializing upload...' 
                    : progress < 70 
                    ? 'Uploading to IPFS network...' 
                    : 'Finalizing storage...'
                  }
                </p>
              </div>
            )}

            {/* Upload Button */}
            <div className="text-center">
              <button
                onClick={handleUpload}
                disabled={isUploading || !isStorachaConnected}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-purple-300 flex items-center justify-center space-x-2 mx-auto"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading to Storacha...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5" />
                    <span>Upload to Decentralized Storage</span>
                  </>
                )}
              </button>
            </div>

            {/* Information */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">About Decentralized Storage</p>
                  <p>Your PDF will be stored on the Filecoin network via Web3.Storage, ensuring permanent, censorship-resistant storage with cryptographic proof of integrity.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Success */}
        {isStorachaConnected && uploadComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Upload Successful!</h3>
                <p className="text-green-800 mb-4">
                  Your incident report has been successfully uploaded to the decentralized storage network.
                </p>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Content ID (CID):</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(uploadHash)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded mt-1 block break-all font-mono">
                      {uploadHash}
                    </code>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <span className="font-medium text-gray-700">Access URL:</span>
                    <a 
                      href={`https://w3s.link/ipfs/${uploadHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline block mt-1 break-all"
                    >
                      https://w3s.link/ipfs/{uploadHash}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={isUploading}
          className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        {uploadComplete && (
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center space-x-2"
          >
            <span>Continue to Contract Submission</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}