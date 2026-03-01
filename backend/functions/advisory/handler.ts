import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { invokeBedrockModel } from '../../layers/common/bedrock';
import { putItem, queryItems } from '../../layers/common/dynamodb';

const SYSTEM_PROMPT = `You are an expert poultry farming advisor with deep knowledge of:
- Poultry breeds and their characteristics
- Disease prevention and treatment
- Feed optimization and nutrition
- Farm management best practices
- Business planning for poultry farms
- Vaccination schedules
- Housing and environmental management

Provide practical, actionable advice to poultry farmers. Be concise and specific.
Always prioritize bird welfare and sustainable farming practices.`;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { message, conversationId } = body;

    if (!message) {
      return createErrorResponse(400, 'Message is required');
    }

    // Get conversation history if conversationId exists
    let conversationHistory: any[] = [];
    let currentConversationId = conversationId;

    if (conversationId) {
      conversationHistory = await queryItems(
        'conversations',
        'conversationId = :cid',
        { ':cid': conversationId }
      );
    } else {
      currentConversationId = uuidv4();
    }

    // Build messages array for Bedrock
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call Bedrock
    const response = await invokeBedrockModel(messages, SYSTEM_PROMPT);

    // Save user message
    await putItem('conversations', {
      conversationId: currentConversationId,
      messageId: uuidv4(),
      userId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Save assistant response
    await putItem('conversations', {
      conversationId: currentConversationId,
      messageId: uuidv4(),
      userId,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    });

    return createResponse(200, {
      conversationId: currentConversationId,
      message: response,
    });
  } catch (error) {
    console.error('Error in advisory handler:', error);
    return createErrorResponse(500, 'Failed to process advisory request');
  }
};
