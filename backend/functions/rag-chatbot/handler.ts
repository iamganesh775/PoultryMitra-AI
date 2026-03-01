import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  BedrockAgentRuntimeClient, 
  RetrieveAndGenerateCommand 
} from '@aws-sdk/client-bedrock-agent-runtime';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { putItem, queryItems } from '../../layers/common/dynamodb';

const agentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });

/**
 * RAG-powered Chatbot using Bedrock Knowledge Base
 * Provides context-aware responses using farm knowledge base
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { query, sessionId } = body;

    if (!query) {
      return createErrorResponse(400, 'Query is required');
    }

    const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID!;
    const modelArn = `arn:aws:bedrock:${process.env.AWS_REGION}::foundation-model/${process.env.BEDROCK_MODEL_ID}`;

    // Retrieve and generate using knowledge base
    const command = new RetrieveAndGenerateCommand({
      input: {
        text: query,
      },
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId,
          modelArn,
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: 5,
            },
          },
        },
      },
      sessionId: sessionId || undefined,
    });

    const response = await agentClient.send(command);

    // Extract response and citations
    const generatedText = response.output?.text || '';
    const citations = response.citations?.map(citation => ({
      text: citation.generatedResponsePart?.textResponsePart?.text,
      references: citation.retrievedReferences?.map(ref => ({
        content: ref.content?.text,
        location: ref.location?.s3Location?.uri,
      })),
    })) || [];

    // Save interaction
    const interactionId = uuidv4();
    await putItem('rag-interactions', {
      id: interactionId,
      userId,
      sessionId: response.sessionId,
      query,
      response: generatedText,
      citations: JSON.stringify(citations),
      timestamp: new Date().toISOString(),
    });

    return createResponse(200, {
      sessionId: response.sessionId,
      response: generatedText,
      citations,
      sources: citations.length,
    });
  } catch (error) {
    console.error('Error in RAG chatbot handler:', error);
    return createErrorResponse(500, 'Failed to process RAG query');
  }
};

/**
 * Get RAG conversation history
 */
export const getHistory = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const sessionId = event.queryStringParameters?.sessionId;

    let interactions;
    if (sessionId) {
      interactions = await queryItems(
        'rag-interactions',
        'userId = :uid AND sessionId = :sid',
        { ':uid': userId, ':sid': sessionId }
      );
    } else {
      interactions = await queryItems(
        'rag-interactions',
        'userId = :uid',
        { ':uid': userId }
      );
    }

    return createResponse(200, { interactions });
  } catch (error) {
    console.error('Error fetching RAG history:', error);
    return createErrorResponse(500, 'Failed to fetch history');
  }
};
