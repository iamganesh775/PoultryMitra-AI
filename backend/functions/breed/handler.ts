import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, createErrorResponse } from '../../layers/common/utils';
import { invokeBedrockModel } from '../../layers/common/bedrock';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { purpose, climate, experience, budget } = body;

    const prompt = `As a poultry farming expert, recommend the top 3 chicken breeds based on:
- Purpose: ${purpose}
- Climate: ${climate}
- Farmer experience: ${experience}
- Budget: ${budget}

For each breed, provide:
1. Breed name
2. Suitability score (0-1)
3. Pros (3-4 points)
4. Cons (2-3 points)
5. Expected production (eggs per year, meat weight)

Format as JSON array with keys: breed, suitability, pros, cons, expectedProduction`;

    const response = await invokeBedrockModel(
      [{ role: 'user', content: prompt }],
      'You are a poultry breed specialist with expertise in matching breeds to farm requirements.'
    );

    let recommendations;
    try {
      recommendations = JSON.parse(response);
    } catch {
      // Fallback recommendations
      recommendations = [
        {
          breed: 'Rhode Island Red',
          suitability: 0.9,
          pros: ['Hardy and disease-resistant', 'Good egg production', 'Dual-purpose breed'],
          cons: ['Can be aggressive', 'Moderate meat quality'],
          expectedProduction: { eggs: 250, meat: 3.5 },
        },
      ];
    }

    return createResponse(200, { recommendations });
  } catch (error) {
    console.error('Error in breed recommendation handler:', error);
    return createErrorResponse(500, 'Failed to generate breed recommendations');
  }
};
