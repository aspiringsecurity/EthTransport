import { useState } from 'react';
import { Link, Cloud, CheckCircle, AlertCircle } from 'lucide-react';

interface StorachaCredentials {
  email: string;
  spaceDID: string;
}

interface StorachaConnectionProps {
  onConnect: (credentials: StorachaCredentials) => void;
  isConnected: boolean;
  credentials?: StorachaCredentials;
}

export default function StorachaConnection({
  onConnect,
  isConnected,
  credentials
}: StorachaConnectionProps) {
  const [email, setEmail] = useState(credentials?.email || '');
  const [spaceDID, setSpaceDID] = useState(credentials?.spaceDID || '');
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; spaceDID?: string }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSpaceDID = (did: string): boolean => {
    // DID format validation - should start with 'did:key:' followed by base58 encoded key
    const didRegex = /^did:key:[a-km-zA-HJ-NP-Z1-9]+$/;
    return didRegex.test(did);
  };

  const handleConnect = async () => {
    setIsValidating(true);
    setErrors({});

    const newErrors: { email?: string; spaceDID?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!spaceDID) {
      newErrors.spaceDID = 'Space DID is required';
    } else if (!validateSpaceDID(spaceDID)) {
      newErrors.spaceDID = 'Please enter a valid DID (format: did:key:...)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsValidating(false);
      return;
    }

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    onConnect({ email, spaceDID });
    setIsValidating(false);
  };

  if (isConnected && credentials) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Connected to Your Storacha Account
            </h3>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <p className="text-sm text-gray-900 mt-1">{credentials.email}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <span className="text-sm font-medium text-gray-700">Space DID:</span>
                <p className="text-sm text-gray-900 mt-1 font-mono break-all">
                  {credentials.spaceDID}
                </p>
              </div>
            </div>
            <button
              onClick={() => onConnect({ email: '', spaceDID: '' })}
              className="mt-4 text-sm text-green-700 hover:text-green-800 underline"
            >
              Change Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6">
      <div className="mb-6 bg-slate-50 rounded-md p-4">
        <div className="flex items-center space-x-3 mb-2">
          <Cloud className="w-6 h-6 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Connect Your Storacha Account</h3>
        </div>
        <p className="text-sm text-slate-600">
          Enter your Storacha credentials to upload the PDF to your own Web3.Storage account
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to get your Storacha credentials:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>
                Sign up at{' '}
                <a
                  href="https://console.web3.storage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  console.web3.storage
                </a>
              </li>
              <li>Create a space and copy the Space DID from your dashboard</li>
              <li>Use the email address you registered with</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="storacha-email" className="block text-sm font-medium text-gray-700 mb-2">
            Storacha Email Address
          </label>
          <input
            id="storacha-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.email}</span>
            </div>
          )}
        </div>

        {/* Space DID Input */}
        <div>
          <label htmlFor="storacha-space-did" className="block text-sm font-medium text-gray-700 mb-2">
            Space DID
          </label>
          <input
            id="storacha-space-did"
            type="text"
            value={spaceDID}
            onChange={(e) => setSpaceDID(e.target.value)}
            placeholder="did:key:z6Mku19GXrPFP2CyTCSPUaMt3mwdyXuZVurpYgvaqUrn6oFz"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              errors.spaceDID ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.spaceDID && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.spaceDID}</span>
            </div>
          )}
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isValidating || !email || !spaceDID}
          className={`w-full py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
            isValidating || !email || !spaceDID
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm'
          }`}
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Validating...</span>
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              <span>Connect to Storacha</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export type { StorachaCredentials };