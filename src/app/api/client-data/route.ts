import { NextRequest, NextResponse } from 'next/server';
import { getResponseDataById } from '@/lib/responseDataAdapter';
import { transformMultiTabData } from '@/lib/responseDataAdapter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const multiTab = searchParams.get('multi_tab') === 'true';

    console.log('Next.js API route - client-data - Request ID:', id);
    console.log('Next.js API route - Multi-tab mode:', multiTab);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id',
        },
        { status: 400 }
      );
    }

    let clientData;
    
    if (multiTab) {
      // Return multi-tab data
      clientData = transformMultiTabData();
      console.log('Next.js API route - Multi-tab data retrieved:', 
        `${clientData.tabs.length} tabs with ${clientData.tabs.reduce((acc, tab) => acc + tab.data.length, 0)} total items`);
    } else {
      // Return single-tab data (existing behavior)
      clientData = getResponseDataById(id);
      console.log('Next.js API route - Single-tab data retrieved:', 
        clientData ? 
        `Success - ${clientData.search_data.length} items found` : 
        'No data found');
    }

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