import { get, post, put, del } from 'aws-amplify/api';
import { uploadData, getUrl } from 'aws-amplify/storage';

const API_NAME = 'PoultryMitraAPI';

// Advisory API
export const sendChatMessage = async (message: string, conversationId?: string) => {
  const response = await post({
    apiName: API_NAME,
    path: '/api/advisory/chat',
    options: {
      body: { message, conversationId }
    }
  });
  return response.body.json();
};

// Disease Detection API
export const uploadDiseaseImage = async (file: File) => {
  const key = `disease-scans/${Date.now()}-${file.name}`;
  const result = await uploadData({
    key,
    data: file,
    options: {
      contentType: file.type
    }
  }).result;
  return result.key;
};

export const detectDisease = async (imageKey: string) => {
  const response = await post({
    apiName: API_NAME,
    path: '/api/disease/scan',
    options: {
      body: { imageKey }
    }
  });
  return response.body.json();
};

// Farm Dashboard API
export const getFarmDashboard = async () => {
  const response = await get({
    apiName: API_NAME,
    path: '/api/farm/dashboard'
  });
  return response.body.json();
};

export const updateFarmData = async (farmData: any) => {
  const response = await put({
    apiName: API_NAME,
    path: '/api/farm',
    options: {
      body: farmData
    }
  });
  return response.body.json();
};

// Breed Recommendation API
export const getBreedRecommendations = async (criteria: any) => {
  const response = await post({
    apiName: API_NAME,
    path: '/api/breed/recommend',
    options: {
      body: criteria
    }
  });
  return response.body.json();
};

// Business Planning API
export const generateBusinessPlan = async (planData: any) => {
  const response = await post({
    apiName: API_NAME,
    path: '/api/business/plan',
    options: {
      body: planData
    }
  });
  return response.body.json();
};

// Invoice Management API
export const getInvoices = async () => {
  const response = await get({
    apiName: API_NAME,
    path: '/api/invoice'
  });
  return response.body.json();
};

export const createInvoice = async (invoiceData: any) => {
  const response = await post({
    apiName: API_NAME,
    path: '/api/invoice',
    options: {
      body: invoiceData
    }
  });
  return response.body.json();
};

export const deleteInvoice = async (invoiceId: string) => {
  const response = await del({
    apiName: API_NAME,
    path: `/api/invoice/${invoiceId}`
  });
  return response.body.json();
};

// Health Scheduler API
export const getVaccinationSchedule = async () => {
  const response = await get({
    apiName: API_NAME,
    path: '/api/health/schedule'
  });
  return response.body.json();
};

export const createVaccinationSchedule = async (scheduleData: any) => {
  const response = await post({
    apiName: API_NAME,
    path: '/api/health/schedule',
    options: {
      body: scheduleData
    }
  });
  return response.body.json();
};

export const updateVaccinationStatus = async (scheduleId: string, status: string) => {
  const response = await put({
    apiName: API_NAME,
    path: `/api/health/schedule/${scheduleId}`,
    options: {
      body: { status }
    }
  });
  return response.body.json();
};
