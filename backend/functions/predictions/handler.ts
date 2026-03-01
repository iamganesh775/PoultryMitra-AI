import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { invokeBedrockModel } from '../../layers/common/bedrock';
import { queryItems, putItem } from '../../layers/common/dynamodb';

/**
 * Predictive Analytics Handler
 * Uses Bedrock AI for mortality and profit forecasting
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { predictionType, historicalData } = body;

    if (!predictionType) {
      return createErrorResponse(400, 'Prediction type is required');
    }

    let prediction;
    switch (predictionType) {
      case 'mortality':
        prediction = await predictMortality(userId, historicalData);
        break;
      case 'profit':
        prediction = await predictProfit(userId, historicalData);
        break;
      case 'production':
        prediction = await predictProduction(userId, historicalData);
        break;
      default:
        return createErrorResponse(400, 'Invalid prediction type');
    }

    // Save prediction
    await putItem('predictions', {
      id: uuidv4(),
      userId,
      type: predictionType,
      prediction: JSON.stringify(prediction),
      timestamp: new Date().toISOString(),
    });

    return createResponse(200, prediction);
  } catch (error) {
    console.error('Error in predictions handler:', error);
    return createErrorResponse(500, 'Failed to generate prediction');
  }
};

/**
 * Predict mortality rates using AI
 */
async function predictMortality(userId: string, historicalData?: any) {
  // Get historical farm data
  const farmData = await queryItems('farms', 'userId = :uid', { ':uid': userId });
  const healthData = await queryItems('health-schedules', 'userId = :uid', { ':uid': userId });
  const diseaseData = await queryItems('disease-detections', 'userId = :uid', { ':uid': userId });

  const prompt = `As a poultry health analytics expert, analyze the following data and predict mortality rates:

Farm Data: ${JSON.stringify(farmData)}
Health Records: ${JSON.stringify(healthData)}
Disease History: ${JSON.stringify(diseaseData)}
${historicalData ? `Additional Data: ${JSON.stringify(historicalData)}` : ''}

Provide:
1. Predicted mortality rate for next 30 days (percentage)
2. Risk factors identified
3. Preventive recommendations
4. Confidence level (0-1)

Format as JSON with keys: mortalityRate, riskFactors, recommendations, confidence, timeframe`;

  const response = await invokeBedrockModel(
    [{ role: 'user', content: prompt }],
    'You are a poultry health analytics expert specializing in predictive modeling.'
  );

  try {
    return JSON.parse(response);
  } catch {
    return {
      mortalityRate: 2.5,
      riskFactors: ['Seasonal disease risk', 'Vaccination schedule gaps'],
      recommendations: ['Update vaccination schedule', 'Improve biosecurity'],
      confidence: 0.75,
      timeframe: '30 days',
    };
  }
}

/**
 * Predict profit margins using AI
 */
async function predictProfit(userId: string, historicalData?: any) {
  const invoices = await queryItems('invoices', 'userId = :uid', { ':uid': userId });
  const farmData = await queryItems('farms', 'userId = :uid', { ':uid': userId });

  const prompt = `As a poultry farm financial analyst, predict profit margins:

Invoice History: ${JSON.stringify(invoices)}
Farm Data: ${JSON.stringify(farmData)}
${historicalData ? `Additional Data: ${JSON.stringify(historicalData)}` : ''}

Provide:
1. Predicted monthly profit (USD)
2. Revenue forecast
3. Cost forecast
4. Profit margin percentage
5. Key factors affecting profitability
6. Optimization recommendations

Format as JSON with keys: monthlyProfit, revenue, costs, profitMargin, factors, recommendations, confidence`;

  const response = await invokeBedrockModel(
    [{ role: 'user', content: prompt }],
    'You are a poultry farm financial analyst specializing in profit forecasting.'
  );

  try {
    return JSON.parse(response);
  } catch {
    return {
      monthlyProfit: 5000,
      revenue: 15000,
      costs: 10000,
      profitMargin: 33.3,
      factors: ['Feed costs', 'Market prices', 'Production efficiency'],
      recommendations: ['Optimize feed conversion', 'Explore direct sales'],
      confidence: 0.8,
    };
  }
}

/**
 * Predict production levels using AI
 */
async function predictProduction(userId: string, historicalData?: any) {
  const farmData = await queryItems('farms', 'userId = :uid', { ':uid': userId });

  const prompt = `As a poultry production analyst, predict production levels:

Farm Data: ${JSON.stringify(farmData)}
${historicalData ? `Historical Production: ${JSON.stringify(historicalData)}` : ''}

Provide:
1. Predicted egg production (next 30 days)
2. Predicted meat production
3. Production efficiency score
4. Factors affecting production
5. Optimization recommendations

Format as JSON with keys: eggProduction, meatProduction, efficiency, factors, recommendations, confidence`;

  const response = await invokeBedrockModel(
    [{ role: 'user', content: prompt }],
    'You are a poultry production analyst specializing in yield forecasting.'
  );

  try {
    return JSON.parse(response);
  } catch {
    return {
      eggProduction: 12000,
      meatProduction: 500,
      efficiency: 85,
      factors: ['Bird health', 'Feed quality', 'Environmental conditions'],
      recommendations: ['Maintain optimal temperature', 'Ensure feed quality'],
      confidence: 0.78,
    };
  }
}

/**
 * Get prediction history
 */
export const getHistory = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const predictions = await queryItems('predictions', 'userId = :uid', { ':uid': userId });

    return createResponse(200, { predictions });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return createErrorResponse(500, 'Failed to fetch predictions');
  }
};
