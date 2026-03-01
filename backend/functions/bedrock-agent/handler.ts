import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { putItem } from '../../layers/common/dynamodb';

const agentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });

/**
 * Bedrock Agent Handler for workflow automation
 * Supports: vaccination scheduling, feed ordering, health monitoring
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { action, parameters } = body;

    if (!action) {
      return createErrorResponse(400, 'Action is required');
    }

    const sessionId = uuidv4();
    const agentId = process.env.BEDROCK_AGENT_ID!;
    const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!;

    // Invoke Bedrock Agent
    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      inputText: JSON.stringify({ action, parameters, userId }),
    });

    const response = await agentClient.send(command);
    
    // Process streaming response
    let agentResponse = '';
    if (response.completion) {
      for await (const event of response.completion) {
        if (event.chunk?.bytes) {
          const chunk = new TextDecoder().decode(event.chunk.bytes);
          agentResponse += chunk;
        }
      }
    }

    // Log agent interaction
    await putItem('agent-interactions', {
      id: uuidv4(),
      userId,
      sessionId,
      action,
      parameters,
      response: agentResponse,
      timestamp: new Date().toISOString(),
    });

    return createResponse(200, {
      sessionId,
      action,
      response: agentResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in Bedrock Agent handler:', error);
    return createErrorResponse(500, 'Failed to process agent request');
  }
};

/**
 * Get agent interaction history
 */
export const getHistory = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const { queryItems } = await import('../../layers/common/dynamodb');
    
    const interactions = await queryItems(
      'agent-interactions',
      'userId = :uid',
      { ':uid': userId }
    );

    return createResponse(200, { interactions });
  } catch (error) {
    console.error('Error fetching agent history:', error);
    return createErrorResponse(500, 'Failed to fetch history');
  }
};
