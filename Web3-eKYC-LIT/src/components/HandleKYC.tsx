import lighthouse from '@lighthouse-web3/sdk';
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import { createSiweMessageWithRecaps, generateAuthSig, LitAbility, LitAccessControlConditionResource } from "@lit-protocol/auth-helpers";
import { useWalletClient } from 'wagmi';
import { useState } from 'react';

function HandleIpfs() {
    const { data: walletClient } = useWalletClient(); 
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadHash, setUploadHash] = useState('');
    const [ciphertext, setCiphertext] = useState('');
    const [dataToEncryptHash, setDataToEncryptHash] = useState('');
    const [decryptedResult, setDecryptedResult] = useState('');
    const [litNodeClient, setLitNodeClient] = useState<any>(null);
    const [sessionSigs, setSessionSigs] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [fileURI, setfileURI] = useState('');
    const [progress, setProgress] = useState(0);

    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;

    const accessControlConditions = [
        {
            contractAddress: "",
            standardContractType: "",
            chain: "sepolia",
            method: "eth_getBalance",
            parameters: [":userAddress", "latest"],
            returnValueTest: {
                comparator: ">=",
                value: "1000000000000",
            },
        },
    ];

    function useEthersSigner(): (() => Promise<ethers.JsonRpcSigner | undefined>) {
        return async () => {
            if (!walletClient) return undefined;
            const provider = new ethers.BrowserProvider(walletClient.transport as any);
            return await provider.getSigner();
        };
    }

    const progressCallback = (progressData: { uploaded: number; total: number }) => {
        const percentageDone = 100 - (progressData.total / progressData.uploaded);
        setProgress(Math.min(percentageDone, 100));
        console.log(percentageDone.toFixed(2));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        
        setIsUploading(true);
        setProgress(0);
        
        try {
            const output = await lighthouse.upload(
                [selectedFile],
                apiKey,
                //@ts-ignore
                undefined,
                //@ts-ignore
                progressCallback
            );
            
            console.log("File Status:", output);
            let link = "https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
            setfileURI(link)
            console.log("fileURI",link);
            setUploadHash(output.data.Hash);
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleEncrypt = async () => {
        if (!uploadHash) return;
        
        setIsEncrypting(true);
        
        try {
            class Lit {
                litNodeClient: any;
                chain;

                constructor(chain: any) {
                    this.chain = chain;
                }

                async connect() {
                    this.litNodeClient = new LitJsSdk.LitNodeClient({
                        litNetwork: "datil-dev",
                    });
                    await this.litNodeClient.connect();
                }

                async encrypt(message: string) {
                    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
                        {
                            //@ts-ignore
                            accessControlConditions,
                            dataToEncrypt: message,
                        },
                        this.litNodeClient,
                    );

                    return {
                        ciphertext,
                        dataToEncryptHash,
                    };
                }
            }

            const chain = "sepolia";
            let myLit = new Lit(chain);
            await myLit.connect();
            console.log("connected successfully");

            const { ciphertext: cipher, dataToEncryptHash: hash } = await myLit.encrypt(fileURI);
            
            console.log("ciphertext", cipher);
            console.log("dataToEncryptHash", hash);
            
            setCiphertext(cipher);
            setDataToEncryptHash(hash);
            setLitNodeClient(myLit.litNodeClient);

            // Prepare session signatures for later decryption
            const getSigner = useEthersSigner();
            const signer = await getSigner();
            if (!signer) {
                console.error("No signer found");
                return;
            }

            const address = await signer.getAddress();
            console.log("Connected address:", address);

            const accsResourceString = await LitAccessControlConditionResource.generateResourceString(
                //@ts-ignore
                accessControlConditions,
                hash
            );
            console.log("accsResourceString: ", accsResourceString);

            const sessionSigs = await myLit.litNodeClient.getSessionSigs({
                chain: "sepolia",
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
                resourceAbilityRequests: [
                    {
                        resource: new LitAccessControlConditionResource(accsResourceString),
                        ability: LitAbility.AccessControlConditionDecryption,
                    },
                ],
                //@ts-ignore
                authNeededCallback: async ({ resourceAbilityRequests, expiration, uri }) => {
                    const toSign = await createSiweMessageWithRecaps({
                        //@ts-ignore
                        uri,
                        //@ts-ignore
                        expiration,
                        //@ts-ignore
                        resources: resourceAbilityRequests,
                        walletAddress: address,
                        nonce: await myLit.litNodeClient.getLatestBlockhash(),
                        litNodeClient: myLit.litNodeClient,
                    });

                    return await generateAuthSig({
                        signer,
                        toSign,
                    });
                },
            });
            
            console.log("sessionSigs", sessionSigs);
            setSessionSigs(sessionSigs);
            
        } catch (error) {
            console.error("Encryption error:", error);
        } finally {
            setIsEncrypting(false);
        }
    };

    const handleDecrypt = async () => {
        if (!ciphertext || !dataToEncryptHash || !sessionSigs || !litNodeClient) return;
        
        setIsDecrypting(true);
        
        try {
            const decryptRes = await LitJsSdk.decryptToString(
                {
                    //@ts-ignore
                    accessControlConditions,
                    ciphertext,
                    dataToEncryptHash,
                    sessionSigs,
                    chain: "sepolia",
                },
                litNodeClient
            );

            console.log("decryptRes:", decryptRes);
            setDecryptedResult(decryptRes);

            await litNodeClient.disconnect();
            console.log("disconnected");
            
        } catch (error) {
            console.error("Decryption error:", error);
        } finally {
            setIsDecrypting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Secure LIT Protocol</h1>
                        <p className="text-gray-300">Upload, encrypt, and decrypt your files step by step</p>
                    </div>

                    {/* File Selection */}
                    <div className="mb-8">
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setSelectedFile(file);
                                }}
                            />
                            <div className="border-2 border-dashed border-purple-400/50 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {selectedFile ? selectedFile.name : 'Choose a file'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {selectedFile ? 'File selected - ready to upload!' : 'Click to browse or drag and drop'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Upload Button */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-medium mb-2">1. Upload to IPFS</h3>
                                <p className="text-gray-400 text-sm mb-4">Store your file on decentralized storage</p>
                            </div>
                            
                            {isUploading && progress > 0 && (
                                <div className="mb-4">
                                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-blue-400 text-xs text-center">{progress.toFixed(1)}% uploaded</p>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                                    !selectedFile || isUploading
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105'
                                }`}
                            >
                                {isUploading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Uploading...
                                    </div>
                                ) : (
                                    'Upload File'
                                )}
                            </button>

                            {uploadHash && (
                                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-green-400 text-xs font-medium mb-1">✅ Upload Complete!</p>
                                    <p className="text-gray-300 text-xs break-all">Hash: {uploadHash.substring(0, 20)}...</p>
                                </div>
                            )}
                        </div>

                        {/* Encrypt Button */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-medium mb-2">2. Encrypt Data</h3>
                                <p className="text-gray-400 text-sm mb-4">Secure with Lit Protocol encryption</p>
                            </div>

                            <button
                                onClick={handleEncrypt}
                                disabled={!uploadHash || isEncrypting}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                                    !uploadHash || isEncrypting
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-purple-500 hover:bg-purple-600 text-white transform hover:scale-105'
                                }`}
                            >
                                {isEncrypting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Encrypting...
                                    </div>
                                ) : (
                                    'Encrypt Data'
                                )}
                            </button>

                            {ciphertext && (
                                <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <p className="text-purple-400 text-xs font-medium mb-1">🔐 Encryption Complete!</p>
                                    <p className="text-gray-300 text-xs">Session signatures ready</p>
                                </div>
                            )}
                        </div>

                        {/* Decrypt Button */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-medium mb-2">3. Decrypt & Verify</h3>
                                <p className="text-gray-400 text-sm mb-4">Unlock and verify your encrypted data</p>
                            </div>

                            <button
                                onClick={handleDecrypt}
                                disabled={!ciphertext || !sessionSigs || isDecrypting}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                                    !ciphertext || !sessionSigs || isDecrypting
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                                }`}
                            >
                                {isDecrypting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Decrypting...
                                    </div>
                                ) : (
                                    'Decrypt Data'
                                )}
                            </button>

                            {decryptedResult && (
                                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-green-400 text-xs font-medium mb-1">✅ Decryption Success!</p>
                                    <p className="text-gray-300 text-xs">Data verified and unlocked</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Display */}
                    {decryptedResult && (
                        <div className="mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
                            <h3 className="text-green-400 font-medium mb-3 flex items-center text-lg">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Decrypted Result
                            </h3>
                            <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
                                <p className="text-white font-mono text-sm leading-relaxed">
                                    {decryptedResult}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Wallet Connection */}
                    
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        Powered by <span className="text-purple-400 font-medium">Lit Protocol</span> & <span className="text-pink-400 font-medium">Lighthouse</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default HandleIpfs;