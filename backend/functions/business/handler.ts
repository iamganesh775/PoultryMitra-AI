import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { invokeBedrockModel } from '../../layers/common/bedrock';
import { putItem } from '../../layers/common/dynamodb';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { initialInvestment, birdCount, feedCostPerBird, expectedEggPrice, expectedMeatPrice } = body;

    // Calculate basic metrics
    const monthlyFeedCost = birdCount * feedCostPerBird;
    const monthlyOperationalCost = monthlyFeedCost * 1.3; // Add 30% for other costs
    const monthlyEggProduction = birdCount * 20; // Assume 20 eggs per bird per month
    const monthlyRevenue = monthlyEggProduction * expectedEggPrice;
    const monthlyProfit = monthlyRevenue - monthlyOperationalCost;
    const breakEvenMonth = Math.ceil(initialInvestment / monthlyProfit);

    // Get AI insights
    const prompt = `As a poultry business consultant, analyze this farm business plan:
- Initial Investment: $${initialInvestment}
- Bird Count: ${birdCount}
- Monthly Feed Cost: $${monthlyFeedCost}
- Projected Monthly Revenue: $${monthlyRevenue}
- Break-even: ${breakEvenMonth} months

Provide 5 specific, actionable insights to optimize profitability and reduce risks.
Format as JSON array of strings.`;

    const response = await invokeBedrockModel(
      [{ role: 'user', content: prompt }],
      'You are a poultry farm business consultant with expertise in financial planning.'
    );

    let insights;
    try {
      insights = JSON.parse(response);
    } catch {
      insights = [
        'Consider diversifying income with both egg and meat production',
        'Implement feed optimization to reduce costs by 10-15%',
        'Plan for seasonal demand variations',
        'Build emergency fund for 3 months of operational costs',
        'Explore direct-to-consumer sales for better margins',
      ];
    }

    const planData = {
      id: uuidv4(),
      userId,
      initialInvestment,
      monthlyExpenses: Math.round(monthlyOperationalCost),
      projectedRevenue: Math.round(monthlyRevenue),
      breakEvenMonth,
      roi: Math.round((monthlyProfit / initialInvestment) * 100),
      insights,
      createdAt: new Date().toISOString(),
    };

    await putItem('business-plans', planData);

    return createResponse(200, planData);
  } catch (error) {
    console.error('Error in business planning handler:', error);
    return createErrorResponse(500, 'Failed to generate business plan');
  }
};
