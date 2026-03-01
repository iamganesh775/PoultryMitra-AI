import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { putItem, queryItems, deleteItem } from '../../layers/common/dynamodb';

export const getInvoices = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const invoices = await queryItems('invoices', 'userId = :uid', { ':uid': userId });

    return createResponse(200, { invoices });
  } catch (error) {
    console.error('Error in get invoices handler:', error);
    return createErrorResponse(500, 'Failed to retrieve invoices');
  }
};

export const createInvoice = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');

    const invoice = {
      id: uuidv4(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    await putItem('invoices', invoice);

    return createResponse(201, { message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Error in create invoice handler:', error);
    return createErrorResponse(500, 'Failed to create invoice');
  }
};

export const deleteInvoiceHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const invoiceId = event.pathParameters?.id;

    if (!invoiceId) {
      return createErrorResponse(400, 'Invoice ID is required');
    }

    await deleteItem('invoices', { id: invoiceId, userId });

    return createResponse(200, { message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error in delete invoice handler:', error);
    return createErrorResponse(500, 'Failed to delete invoice');
  }
};
