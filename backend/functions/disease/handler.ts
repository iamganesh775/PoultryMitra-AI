import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { invokeBedrockModel } from '../../layers/common/bedrock';
import { putItem } from '../../layers/common/dynamodb';

const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { imageKey } = body;

    if (!imageKey) {
      return createErrorResponse(400, 'Image key is required');
    }

    // Use Rekognition to detect labels
    const detectCommand = new DetectLabelsCommand({
      Image: {
        S3Object: {
          Bucket: process.env.S3_BUCKET,
          Name: imageKey,
        },
      },
      MaxLabels: 10,
      MinConfidence: 70,
    });

    const rekognitionResponse = await rekognitionClient.send(detectCommand);
    const labels = rekognitionResponse.Labels?.map(l => l.Name).join(', ') || '';

    // Use Bedrock to analyze and provide recommendations
    const analysisPrompt = `Based on the following image analysis of a poultry bird: ${labels}

Analyze potential health issues and provide:
1. Most likely disease or health condition (if any)
2. Confidence level (0-1)
3. Specific recommendations for treatment or prevention
4. When to consult a veterinarian

Format your response as JSON with keys: disease, confidence, recommendations (array)`;

    const bedrockResponse = await invokeBedrockModel(
      [{ role: 'user', content: analysisPrompt }],
      'You are a poultry disease expert. Analyze images and provide accurate health assessments.'
    );

    // Parse Bedrock response
    let analysis;
    try {
      analysis = JSON.parse(bedrockResponse);
    } catch {
      // Fallback if response is not JSON
      analysis = {
        disease: 'Unable to determine',
        confidence: 0.5,
        recommendations: [
          'Image quality may be insufficient for accurate diagnosis',
          'Consult a veterinarian for proper examination',
          'Monitor bird behavior and symptoms',
        ],
      };
    }

    // Save detection result
    const detectionId = uuidv4();
    await putItem('disease-detections', {
      id: detectionId,
      userId,
      imageKey,
      disease: analysis.disease,
      confidence: analysis.confidence,
      recommendations: analysis.recommendations,
      labels,
      detectedAt: new Date().toISOString(),
    });

    return createResponse(200, {
      id: detectionId,
      imageUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${imageKey}`,
      disease: analysis.disease,
      confidence: analysis.confidence,
      recommendations: analysis.recommendations,
      detectedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in disease detection handler:', error);
    return createErrorResponse(500, 'Failed to detect disease');
  }
};
