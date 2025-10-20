import React, { useState } from 'react';
import { analyzeSymptoms } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AiSymptomCheckerProps {
  onRequestConsultation: (symptomsText: string) => void;
}

export const AiSymptomChecker: React.FC<AiSymptomCheckerProps> = ({ onRequestConsultation }) => {
  const [symptomsText, setSymptomsText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!symptomsText.trim() && !imageFile) {
      setError("Please describe your symptoms or upload an image.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setRequestSent(false);

    try {
        let imageBase64: string | undefined;
        let imageMimeType: string | undefined;

        if (imageFile) {
            const { base64, mimeType } = await fileToBase64(imageFile);
            imageBase64 = base64;
            imageMimeType = mimeType;
        }

        const result = await analyzeSymptoms(symptomsText, imageBase64, imageMimeType);
        setAnalysisResult(result);
    } catch (err) {
        setError("An unexpected error occurred. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRequestClick = () => {
    if (symptomsText) {
        onRequestConsultation(symptomsText);
        setRequestSent(true);
        alert('Your consultation request has been sent! A doctor will be in touch shortly.');
    }
  };


  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 transition-all duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">Describe your symptoms</label>
          <textarea
            id="symptoms"
            rows={6}
            value={symptomsText}
            onChange={(e) => setSymptomsText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., I have a high fever, a dry cough, and a headache."
          />
          <div className="mt-4">
             <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload an image (optional)</label>
             <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
          {imagePreviewUrl && (
            <div className="mt-4">
              <img src={imagePreviewUrl} alt="Symptom preview" className="max-h-40 rounded-lg" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-300 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              "Get AI Analysis"
            )}
          </button>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
      </div>
      
      {analysisResult && (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">AI Analysis Result</h3>
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
            </div>
            <div className="mt-4 text-center">
              {!requestSent ? (
                  <button
                    onClick={handleRequestClick}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300"
                  >
                    Request Doctor Consultation
                  </button>
              ) : (
                <p className="text-green-700 font-semibold p-3 bg-green-100 rounded-lg">
                  ✓ Your request has been sent to a doctor.
                </p>
              )}
            </div>
        </div>
      )}
    </div>
  );
};