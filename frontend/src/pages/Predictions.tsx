import { useState } from 'react';
import { TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

const Predictions = () => {
  const [predictionType, setPredictionType] = useState('mortality');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionType }),
      });
      const data = await res.json();
      setPrediction(data);
    } catch (error) {
      console.error('Failed to get prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Predictive Analytics</h2>

      <div className="card">
        <select
          value={predictionType}
          onChange={(e) => setPredictionType(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        >
          <option value="mortality">Mortality Forecast</option>
          <option value="profit">Profit Forecast</option>
          <option value="production">Production Forecast</option>
        </select>

        <button onClick={handlePredict} disabled={loading} className="btn-primary">
          {loading ? 'Analyzing...' : 'Generate Prediction'}
        </button>
      </div>

      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictionType === 'mortality' && (
            <>
              <div className="card bg-red-50">
                <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                <p className="text-sm text-gray-600">Predicted Mortality</p>
                <p className="text-2xl font-bold">{prediction.mortalityRate}%</p>
              </div>
            </>
          )}
          {predictionType === 'profit' && (
            <>
              <div className="card bg-green-50">
                <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Monthly Profit</p>
                <p className="text-2xl font-bold">${prediction.monthlyProfit}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Predictions;
