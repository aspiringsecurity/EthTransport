import { FileText, Search, Shield, Database, Cloud, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onReportIncident: () => void;
  onSearchIncident: () => void;
}

export default function LandingPage({ onReportIncident, onSearchIncident }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Incident Management System
            </h1>
            <p className="text-gray-600 text-lg mb-3">
              Professional incident reporting with blockchain verification and decentralized storage
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-500">Powered by</span>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Filecoin
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What would you like to do?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from the options below to either report a new incident or search for details of a previously reported incident.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Report New Incident */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Report New Incident</h3>
              <p className="text-gray-600 mb-6">
                Create a comprehensive incident report with PDF generation, secure storage, and blockchain verification.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Professional PDF report generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Secure IPFS storage via Storacha</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Blockchain verification and timestamping</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Photo evidence attachment support</span>
                </div>
              </div>

              <button
                onClick={onReportIncident}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-red-300 flex items-center justify-center space-x-2"
              >
                <span>Report New Incident</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Existing Incident */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Search Incident</h3>
              <p className="text-gray-600 mb-6">
                Look up details of a previously reported incident using its unique incident ID.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Search by incident ID number</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">View original incident details</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Access stored PDF reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Verify blockchain timestamps</span>
                </div>
              </div>

              <button
                onClick={onSearchIncident}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
              >
                <span>Search Incident</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* System Features */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-bold text-gray-900 text-center mb-6">
            Why Use Our Incident Management System?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Immutable Records</h4>
              <p className="text-sm text-gray-600">
                All incidents are permanently recorded on the blockchain, ensuring they cannot be tampered with or lost.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Cloud className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Decentralized Storage</h4>
              <p className="text-sm text-gray-600">
                Reports are stored on IPFS through Storacha, ensuring global accessibility and redundancy.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Cryptographic Proof</h4>
              <p className="text-sm text-gray-600">
                Every report includes cryptographic timestamps and signatures for legal admissibility.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-2">
            <div>© 2025 Incident Management System - Secure • Decentralized • Professional</div>
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <span className="font-semibold text-blue-600">Filecoin Network</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}