import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SNSClient, PublishCommand, SubscribeCommand, ListSubscriptionsByTopicCommand } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { putItem, queryItems } from '../../layers/common/dynamodb';

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

/**
 * Real-time Notifications Handler using Amazon SNS
 * Supports: vaccination reminders, disease alerts, feed alerts
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { type, message, priority = 'normal' } = body;

    if (!type || !message) {
      return createErrorResponse(400, 'Type and message are required');
    }

    const topicArn = process.env.SNS_TOPIC_ARN!;

    // Publish notification to SNS
    const publishCommand = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify({
        userId,
        type,
        message,
        priority,
        timestamp: new Date().toISOString(),
      }),
      Subject: `PoultryMitra Alert: ${type}`,
      MessageAttributes: {
        type: {
          DataType: 'String',
          StringValue: type,
        },
        priority: {
          DataType: 'String',
          StringValue: priority,
        },
        userId: {
          DataType: 'String',
          StringValue: userId,
        },
      },
    });

    const response = await snsClient.send(publishCommand);

    // Save notification to database
    await putItem('notifications', {
      id: uuidv4(),
      userId,
      type,
      message,
      priority,
      messageId: response.MessageId,
      status: 'sent',
      timestamp: new Date().toISOString(),
    });

    return createResponse(200, {
      messageId: response.MessageId,
      status: 'sent',
    });
  } catch (error) {
    console.error('Error in notifications handler:', error);
    return createErrorResponse(500, 'Failed to send notification');
  }
};

/**
 * Subscribe to notifications
 */
export const subscribe = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { endpoint, protocol = 'email' } = body;

    if (!endpoint) {
      return createErrorResponse(400, 'Endpoint is required');
    }

    const topicArn = process.env.SNS_TOPIC_ARN!;

    const subscribeCommand = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint,
      Attributes: {
        FilterPolicy: JSON.stringify({
          userId: [userId],
        }),
      },
    });

    const response = await snsClient.send(subscribeCommand);

    // Save subscription
    await putItem('notification-subscriptions', {
      userId,
      subscriptionArn: response.SubscriptionArn,
      endpoint,
      protocol,
      createdAt: new Date().toISOString(),
    });

    return createResponse(200, {
      subscriptionArn: response.SubscriptionArn,
      status: 'subscribed',
    });
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return createErrorResponse(500, 'Failed to subscribe');
  }
};

/**
 * Get notification history
 */
export const getNotifications = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    
    const notifications = await queryItems(
      'notifications',
      'userId = :uid',
      { ':uid': userId }
    );

    return createResponse(200, { notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return createErrorResponse(500, 'Failed to fetch notifications');
  }
};
