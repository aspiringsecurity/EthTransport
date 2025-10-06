import React, { useState } from 'react';
import { generateIncidentPDF } from '../lib/generateIncidentPDF';
import StorachaPDFUpload from './StorachaPDFUpload';
import StorachaConnection from './StorachaConnection';
import ContractHandler from './ContractHandler';
import type { StorachaCredentials } from './StorachaConnection';

export default function IncidentFormWithPDF() {
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isElderlyInvolved, setIsElderlyInvolved] = useState(false);
    const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
    const [storachaCID, setStorachaCID] = useState('');
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pdf = await generateIncidentPDF({
            location,
            description,
            isElderlyInvolved,
            image,
        });

        setPdfBytes(pdf);

        // Optional: Download immediately
        const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'incident_report.pdf';
        link.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">Incident Report Form</h1>
                    <p className="text-blue-600">Fill out the details below to generate your incident report</p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <h2 className="text-xl font-semibold text-white">Report Details</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Location Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-blue-900 uppercase tracking-wide">
                                Incident Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-blue-300"
                                placeholder="Enter the incident location"
                            />
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-blue-900 uppercase tracking-wide">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-blue-300 resize-none"
                                placeholder="Provide a detailed description of the incident"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-blue-900 uppercase tracking-wide">
                                Upload Image
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {image && (
                                    <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                                        ✓ {image.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Elderly Involvement */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-blue-900 uppercase tracking-wide">
                                Elderly Involved?
                            </label>
                            <div className="flex space-x-6">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            checked={isElderlyInvolved}
                                            onChange={() => setIsElderlyInvolved(true)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                                            isElderlyInvolved 
                                                ? 'bg-blue-600 border-blue-600' 
                                                : 'border-blue-300 group-hover:border-blue-400'
                                        }`}>
                                            {isElderlyInvolved && (
                                                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-blue-800 font-medium">Yes</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            checked={!isElderlyInvolved}
                                            onChange={() => setIsElderlyInvolved(false)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                                            !isElderlyInvolved 
                                                ? 'bg-blue-600 border-blue-600' 
                                                : 'border-blue-300 group-hover:border-blue-400'
                                        }`}>
                                            {!isElderlyInvolved && (
                                                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-blue-800 font-medium">No</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300"
                            >
                                Generate PDF Report
                            </button>
                        </div>
                    </form>
                </div>

                {/* Storacha Upload Section */}
                {pdfBytes && (
                    <div className="mt-8 bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4">
                            <h3 className="text-lg font-semibold text-white">Upload to Storage</h3>
                        </div>
                        <div className="p-6">
                            <StorachaConnection
                                onConnect={handleStorachaConnect}
                                isConnected={isStorachaConnected}
                                credentials={storachaCredentials || undefined}
                            />
                            {isStorachaConnected && storachaCredentials && (
                                <StorachaPDFUpload
                                    pdfBytes={pdfBytes}
                                    storachaCredentials={storachaCredentials}
                                    onUploadComplete={(cid, url) => {
                                        console.log('PDF uploaded to Storacha:', cid, url);
                                        setStorachaCID(cid);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Contract Handler Section */}
                {storachaCID && (
                    <div className="mt-8 bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4">
                            <h3 className="text-lg font-semibold text-white">Contract Processing</h3>
                        </div>
                        <div className="p-6">
                            <ContractHandler pdfCID={`https://w3s.link/ipfs/${storachaCID}`} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}