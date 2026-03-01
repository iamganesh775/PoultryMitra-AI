import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bird, TrendingUp, TrendingDown } from 'lucide-react';
import { getBreedRecommendations } from '../services/api';
import { BreedRecommendation } from '../types';

const BreedRecommendationPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<BreedRecommendation[]>([]);
  const [criteria, setCriteria] = useState({
    purpose: 'eggs',
    climate: 'moderate',
    experience: 'beginner',
    budget: 'medium',
  });

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const data = await getBreedRecommendations(criteria);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{t('nav.breedRecommendation')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Criteria Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Your Requirements</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Purpose
              </label>
              <select
                value={criteria.purpose}
                onChange={(e) => setCriteria({ ...criteria, purpose: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="eggs">Egg Production</option>
                <option value="meat">Meat Production</option>
                <option value="dual">Dual Purpose</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Climate
              </label>
              <select
                value={criteria.climate}
                onChange={(e) => setCriteria({ ...criteria, climate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="hot">Hot</option>
                <option value="moderate">Moderate</option>
                <option value="cold">Cold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={criteria.experience}
                onChange={(e) => setCriteria({ ...criteria, experience: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <select
                value={criteria.budget}
                onChange={(e) => setCriteria({ ...criteria, budget: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          {recommendations.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <Bird className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select your criteria and get AI-powered breed recommendations</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div key={index} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{rec.breed}</h3>
                    <p className="text-sm text-gray-600">
                      Suitability: {(rec.suitability * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Expected Production</p>
                    <p className="font-semibold">
                      {rec.expectedProduction.eggs} eggs/year
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Advantages</span>
                    </div>
                    <ul className="space-y-1">
                      {rec.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-700">• {pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Considerations</span>
                    </div>
                    <ul className="space-y-1">
                      {rec.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-700">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BreedRecommendationPage;
