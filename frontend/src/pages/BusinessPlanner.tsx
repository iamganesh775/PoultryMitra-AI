import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { generateBusinessPlan } from '../services/api';
import { BusinessPlan } from '../types';

const BusinessPlanner = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [formData, setFormData] = useState({
    initialInvestment: 10000,
    birdCount: 500,
    feedCostPerBird: 5,
    expectedEggPrice: 0.5,
    expectedMeatPrice: 3,
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateBusinessPlan(formData);
      setPlan(result);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{t('nav.businessPlanner')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Business Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Investment ($)
              </label>
              <input
                type="number"
                value={formData.initialInvestment}
                onChange={(e) => setFormData({ ...formData, initialInvestment: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Birds
              </label>
              <input
                type="number"
                value={formData.birdCount}
                onChange={(e) => setFormData({ ...formData, birdCount: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feed Cost per Bird ($/month)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.feedCostPerBird}
                onChange={(e) => setFormData({ ...formData, feedCostPerBird: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate Business Plan'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!plan ? (
            <div className="card text-center py-12 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Enter your parameters to generate an AI-powered business plan</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="card bg-blue-50">
                  <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold">${plan.monthlyExpenses}</p>
                </div>
                <div className="card bg-green-50">
                  <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Projected Revenue</p>
                  <p className="text-2xl font-bold">${plan.projectedRevenue}</p>
                </div>
                <div className="card bg-purple-50">
                  <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">Break-even</p>
                  <p className="text-2xl font-bold">{plan.breakEvenMonth} months</p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                <ul className="space-y-2">
                  {plan.insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanner;
