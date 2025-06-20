import { NextRequest, NextResponse } from 'next/server';
import { getResponseDataById } from '@/lib/responseDataAdapter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Next.js API route - client-data - Request ID:', id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id',
        },
        { status: 400 }
      );
    }

    // Get data from response.json file based on ID
    const clientData = getResponseDataById(id);
    
    console.log('Next.js API route - Data retrieved:', 
      clientData ? 
      `Success - ${clientData.search_data.length} items found` : 
      'No data found');

    if (!clientData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client data not found',
        },
        { status: 404 }
      );
    }

    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: clientData,
      message: 'Data retrieved successfully',
    });
  } catch (error) {
    console.error('Error in client-data API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}