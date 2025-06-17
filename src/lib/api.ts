import { ClientData, ApiResponse } from './types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions' 
  : '/api';

export async function fetchClientData(requestId: string): Promise<ApiResponse<ClientData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/client-data?id=${encodeURIComponent(requestId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching client data:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function healthCheck(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
    };
  }
}