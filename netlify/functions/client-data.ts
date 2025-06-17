import { Handler } from '@netlify/functions';
import { mockClientData, getMockDataById } from '../../src/lib/mockData';

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
    };
  }

  try {
    const { id } = event.queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required parameter: id',
        }),
      };
    }

    // Get mock data based on ID
    const clientData = getMockDataById(id);

    if (!clientData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Client data not found',
        }),
      };
    }

    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: clientData,
        message: 'Data retrieved successfully',
      }),
    };
  } catch (error) {
    console.error('Error in client-data function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
    };
  }
};