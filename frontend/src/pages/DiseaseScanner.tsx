import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import { uploadDiseaseImage, detectDisease } from '../services/api';
import { DiseaseDetection } from '../types';

const DiseaseScanner = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<DiseaseDetection | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    try {
      const imageKey = await uploadDiseaseImage(selectedFile);
      const detection = await detectDisease(imageKey);
      setResult(detection);
    } catch (error) {
      console.error('Failed to scan image:', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{t('diseaseScanner.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upload Image</h3>
          
          {!preview ? (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <Camera className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-sm text-gray-600">Click to upload poultry image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {scanning ? t('diseaseScanner.scanning') : 'Scan for Disease'}
                </button>
                <button
                  onClick={() => {
                    setPreview('');
                    setSelectedFile(null);
                    setResult(null);
                  }}
                  className="btn-secondary"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{t('diseaseScanner.results')}</h3>
          
          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Upload className="h-12 w-12 mb-4" />
              <p className="text-sm">Upload and scan an image to see results</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">{result.disease}</h4>
                    <p className="text-sm text-yellow-700">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseScanner;
