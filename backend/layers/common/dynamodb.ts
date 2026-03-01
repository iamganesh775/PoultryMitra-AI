import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'poultry-mitra';

export const getTableName = (entity: string): string => {
  return `${TABLE_PREFIX}-${entity}`;
};

export const putItem = async (tableName: string, item: any) => {
  const command = new PutCommand({
    TableName: getTableName(tableName),
    Item: item,
  });
  return docClient.send(command);
};

export const getItem = async (tableName: string, key: any) => {
  const command = new GetCommand({
    TableName: getTableName(tableName),
    Key: key,
  });
  const response = await docClient.send(command);
  return response.Item;
};

export const queryItems = async (
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: any
) => {
  const command = new QueryCommand({
    TableName: getTableName(tableName),
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

export const updateItem = async (
  tableName: string,
  key: any,
  updateExpression: string,
  expressionAttributeValues: any
) => {
  const command = new UpdateCommand({
    TableName: getTableName(tableName),
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });
  const response = await docClient.send(command);
  return response.Attributes;
};

export const deleteItem = async (tableName: string, key: any) => {
  const command = new DeleteCommand({
    TableName: getTableName(tableName),
    Key: key,
  });
  return docClient.send(command);
};

export const scanItems = async (tableName: string, filterExpression?: string, expressionAttributeValues?: any) => {
  const command = new ScanCommand({
    TableName: getTableName(tableName),
    ...(filterExpression && { FilterExpression: filterExpression }),
    ...(expressionAttributeValues && { ExpressionAttributeValues: expressionAttributeValues }),
  });
  const response = await docClient.send(command);
  return response.Items || [];
};
