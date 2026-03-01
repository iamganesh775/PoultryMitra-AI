import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { getItem, putItem, queryItems } from '../../layers/common/dynamodb';

export const getDashboard = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);

    // Get farm data
    const farmData = await getItem('farms', { userId });

    // Get recent activities
    const activities = await queryItems(
      'activities',
      'userId = :uid',
      { ':uid': userId }
    );

    // Mock production data (in production, this would come from actual records)
    const productionData = [
      { month: 'Jan', eggs: 12000 },
      { month: 'Feb', eggs: 13500 },
      { month: 'Mar', eggs: 14200 },
      { month: 'Apr', eggs: 15000 },
      { month: 'May', eggs: 14800 },
      { month: 'Jun', eggs: 15500 },
    ];

    return createResponse(200, {
      totalBirds: farmData?.totalBirds || 0,
      activeBreeds: farmData?.breeds?.length || 0,
      healthScore: farmData?.healthScore || 95,
      monthlyRevenue: farmData?.monthlyRevenue || 0,
      productionData,
      recentActivities: activities.slice(0, 5),
    });
  } catch (error) {
    console.error('Error in farm dashboard handler:', error);
    return createErrorResponse(500, 'Failed to load dashboard');
  }
};

export const updateFarm = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');

    const farmData = {
      userId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await putItem('farms', farmData);

    return createResponse(200, { message: 'Farm data updated successfully', data: farmData });
  } catch (error) {
    console.error('Error in farm update handler:', error);
    return createErrorResponse(500, 'Failed to update farm data');
  }
};
