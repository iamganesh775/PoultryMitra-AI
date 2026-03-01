import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { putItem, queryItems, updateItem } from '../../layers/common/dynamodb';

export const getSchedule = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const schedules = await queryItems('health-schedules', 'userId = :uid', { ':uid': userId });

    // Update overdue status
    const now = new Date();
    const updatedSchedules = schedules.map((schedule: any) => {
      const dueDate = new Date(schedule.dueDate);
      if (dueDate < now && schedule.status === 'pending') {
        return { ...schedule, status: 'overdue' };
      }
      return schedule;
    });

    return createResponse(200, { schedules: updatedSchedules });
  } catch (error) {
    console.error('Error in get schedule handler:', error);
    return createErrorResponse(500, 'Failed to retrieve schedules');
  }
};

export const createSchedule = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');

    const schedule = {
      id: uuidv4(),
      userId,
      status: 'pending',
      ...body,
      createdAt: new Date().toISOString(),
    };

    await putItem('health-schedules', schedule);

    return createResponse(201, { message: 'Schedule created successfully', schedule });
  } catch (error) {
    console.error('Error in create schedule handler:', error);
    return createErrorResponse(500, 'Failed to create schedule');
  }
};

export const updateScheduleStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const scheduleId = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    const { status } = body;

    if (!scheduleId) {
      return createErrorResponse(400, 'Schedule ID is required');
    }

    const updated = await updateItem(
      'health-schedules',
      { id: scheduleId, userId },
      'SET #status = :status, updatedAt = :updatedAt',
      {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      }
    );

    return createResponse(200, { message: 'Schedule updated successfully', schedule: updated });
  } catch (error) {
    console.error('Error in update schedule handler:', error);
    return createErrorResponse(500, 'Failed to update schedule');
  }
};
