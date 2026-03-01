import { SNSClient, PublishCommand, SubscribeCommand } from '@aws-sdk/client-sns';

const client = new SNSClient({ region: process.env.AWS_REGION });

export interface NotificationMessage {
  userId: string;
  type: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
  data?: any;
}

/**
 * Publish notification to SNS topic
 */
export const publishNotification = async (
  topicArn: string,
  notification: NotificationMessage
): Promise<string> => {
  const command = new PublishCommand({
    TopicArn: topicArn,
    Message: JSON.stringify(notification),
    Subject: `PoultryMitra: ${notification.type}`,
    MessageAttributes: {
      type: {
        DataType: 'String',
        StringValue: notification.type,
      },
      priority: {
        DataType: 'String',
        StringValue: notification.priority || 'normal',
      },
      userId: {
        DataType: 'String',
        StringValue: notification.userId,
      },
    },
  });

  const response = await client.send(command);
  return response.MessageId!;
};

/**
 * Subscribe to SNS topic
 */
export const subscribeToTopic = async (
  topicArn: string,
  protocol: 'email' | 'sms' | 'https',
  endpoint: string,
  filterPolicy?: any
): Promise<string> => {
  const command = new SubscribeCommand({
    TopicArn: topicArn,
    Protocol: protocol,
    Endpoint: endpoint,
    ...(filterPolicy && {
      Attributes: {
        FilterPolicy: JSON.stringify(filterPolicy),
      },
    }),
  });

  const response = await client.send(command);
  return response.SubscriptionArn!;
};
