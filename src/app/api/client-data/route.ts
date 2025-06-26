import { NextRequest, NextResponse } from 'next/server';
import { transformZohoResponse } from '@/lib/zohoDataAdapter';

// Helper function to map HTTP status codes to user-friendly error messages
function getErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Invalid request parameters';
    case 404:
      return 'Request not found';
    case 405:
      return 'Method not allowed';
    case 500:
      return 'Internal server error';
    default:
      return `API request failed with status ${statusCode}`;
  }
}

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

    // Validate request_id format (basic sanitization)
    if (typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request ID format',
        },
        { status: 400 }
      );
    }

    // Call Zoho CRM API
    const zohoApiUrl = `https://www.zohoapis.com/crm/v7/functions/reportsverifyrequest/actions/execute?auth_type=apikey&zapikey=1003.b4daf196f98f3eb7384001029bef052b.df35bcc288d326b63ebe0758f65c5d85&request_id=${encodeURIComponent(id)}`;
    
    console.log('Next.js API route - Calling Zoho API for request_id:', id);
    
    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let zohoResponse;
    try {
      zohoResponse = await fetch(zohoApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle network errors and timeouts
      if (fetchError.name === 'AbortError') {
        console.error('Zoho API request timeout');
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - please try again',
            code: '408',
          },
          { status: 408 }
        );
      }
      
      console.error('Network error calling Zoho API:', fetchError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Network error - please check your connection and try again',
        },
        { status: 500 }
      );
    }

    // Handle different HTTP status codes from Zoho API  
    if (!zohoResponse.ok) {
      const errorMessage = getErrorMessage(zohoResponse.status);
      console.error(`Zoho API error: ${zohoResponse.status} - ${errorMessage}`);
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: zohoResponse.status.toString(),
        },
        { status: zohoResponse.status === 404 ? 404 : 400 }
      );
    }

    // Parse the response
    let zohoData;
    try {
      const responseText = await zohoResponse.text();
      console.log('Zoho API response received, length:', responseText.length);
      
      // Try to parse as JSON
      zohoData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Zoho API response as JSON:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response format from API',
        },
        { status: 500 }
      );
    }

    // Transform the Zoho response to match frontend expectations
    const transformedData = transformZohoResponse(zohoData);
    
    console.log('Next.js API route - Data transformed successfully:', 
      `${transformedData.tabs.length} tabs with ${transformedData.tabs.reduce((acc, tab) => acc + tab.data.length, 0)} total items`);

    return NextResponse.json({
      success: true,
      data: transformedData,
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