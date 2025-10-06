import { useState } from 'react';
import { FileText, Download, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { generateIncidentPDF } from '../../lib/generateIncidentPDF';

interface IncidentData {
  location: string;
  description: string;
  isElderlyInvolved: boolean;
  image?: File | null;
}

interface PDFGenerationStepProps {
  incidentData: IncidentData;
  onNext: (pdfBytes: Uint8Array) => void;
  onBack: () => void;
}

export default function PDFGenerationStep({ incidentData, onNext, onBack }: PDFGenerationStepProps) {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generateIncidentPDF(incidentData);
      setPdfBytes(pdf);

      // Create blob URL for preview
      const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBytes) return;

    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'incident_report.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleContinue = () => {
    if (pdfBytes) {
      onNext(pdfBytes);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate PDF Report</h2>
        <p className="text-gray-600">
          Create a professional incident report document with all the details you provided
        </p>
      </div>

      {/* Incident Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-gray-500 font-medium min-w-24">Location:</span>
            <span className="text-gray-900">{incidentData.location}</span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 font-medium min-w-24">Description:</span>
            <span className="text-gray-900">{incidentData.description}</span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 font-medium min-w-24">Elderly:</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              incidentData.isElderlyInvolved
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {incidentData.isElderlyInvolved ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 font-medium min-w-24">Image:</span>
            <span className="text-gray-900">
              {incidentData.image ? `${incidentData.image.name} (${(incidentData.image.size / 1024 / 1024).toFixed(2)} MB)` : 'No image attached'}
            </span>
          </div>
        </div>
      </div>

      {/* PDF Generation */}
      {!pdfBytes ? (
        <div className="text-center">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-green-300 flex items-center justify-center space-x-2 mx-auto"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Generate PDF Report</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* PDF Preview */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">PDF Report Generated</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </a>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">incident_report.pdf</p>
                  <p className="text-sm text-gray-500">
                    {(pdfBytes.length / 1024).toFixed(1)} KB • Ready for upload
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Professional Report Generated</p>
                  <p>Your incident report has been formatted with timestamps, unique ID, and all provided details. The document is ready for secure storage.</p>
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
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        {pdfBytes && (
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center space-x-2"
          >
            <span>Continue to Storage Upload</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}