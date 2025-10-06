import { useState } from 'react';
import { MapPin, FileText, Camera, Users, ArrowRight } from 'lucide-react';

interface IncidentData {
  location: string;
  description: string;
  isElderlyInvolved: boolean;
  image?: File | null;
}

interface IncidentFormStepProps {
  data: IncidentData;
  onNext: (data: IncidentData) => void;
}

export default function IncidentFormStep({ data, onNext }: IncidentFormStepProps) {
  const [formData, setFormData] = useState<IncidentData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof IncidentData, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('image', e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Incident Details</h2>
        <p className="text-gray-600">
          Please provide accurate information about the incident to generate a comprehensive report
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            Incident Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400 ${
              errors.location 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Enter the exact location where the incident occurred"
          />
          {errors.location && (
            <p className="text-red-500 text-sm flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.location}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            Incident Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400 resize-none ${
              errors.description 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Provide a detailed description of what happened, including time, weather conditions, and any other relevant details"
          />
          {errors.description && (
            <p className="text-red-500 text-sm flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.description}
            </p>
          )}
          <div className="text-right text-xs text-gray-500">
            {formData.description.length}/500 characters
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <Camera className="w-4 h-4 mr-2 text-gray-500" />
            Evidence Photo (Optional)
          </label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              {formData.image ? (
                <div className="flex items-center justify-center space-x-2">
                  <Camera className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    {formData.image.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div>
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Elderly Involvement */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            Elderly Person Involved?
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  checked={formData.isElderlyInvolved}
                  onChange={() => handleInputChange('isElderlyInvolved', true)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  formData.isElderlyInvolved 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {formData.isElderlyInvolved && (
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium">Yes</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  checked={!formData.isElderlyInvolved}
                  onChange={() => handleInputChange('isElderlyInvolved', false)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  !formData.isElderlyInvolved 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {!formData.isElderlyInvolved && (
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium">No</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
          >
            <span>Continue to PDF Generation</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}