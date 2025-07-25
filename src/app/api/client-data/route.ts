import { NextRequest, NextResponse } from 'next/server';
import { transformZohoResponse } from '@/lib/zohoDataAdapter';

// Google Cloud job queue configuration
const GCLOUD_BASE_URL = process.env.GCLOUD_BASE_URL || 'https://us-central1-excel-pptx-merger.cloudfunctions.net/excel-pptx-merger';
const GCLOUD_API_TOKEN = process.env.GCLOUD_API_TOKEN;

if (!GCLOUD_API_TOKEN) {
  console.warn('GCLOUD_API_TOKEN environment variable not set');
}

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

    // Step 1: Call Zoho API to get extract job payload
    const zohoApiUrl = `https://www.zohoapis.com/crm/v7/functions/reportsverifyrequest/actions/execute?auth_type=apikey&zapikey=1003.b4daf196f98f3eb7384001029bef052b.df35bcc288d326b63ebe0758f65c5d85&request_id=${encodeURIComponent(id)}`;
    
    console.log('Next.js API route - Step 1: Calling Zoho API for request_id:', id);
    
    let extractPayload;
    try {
      const zohoResponse = await fetch(zohoApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

      const responseText = await zohoResponse.text();
      console.log('Zoho API response received, length:', responseText.length);
      
      extractPayload = JSON.parse(responseText);
      console.log('DEBUG - Raw Zoho API response (extract payload):', JSON.stringify(extractPayload, null, 2));
      
      console.log('Zoho API - Extract payload validation:', {
        hasSharePointUrl: !!extractPayload.sharepoint_excel_url,
        sheetCount: extractPayload.sheet_names?.length || 0,
        hasConfig: !!extractPayload.config,
        payloadKeys: Object.keys(extractPayload || {})
      });
    } catch (error: any) {
      console.error('Error calling Zoho API:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get extraction parameters from Zoho API',
        },
        { status: 500 }
      );
    }

    // Step 2: Start Google Cloud extract job
    console.log('Next.js API route - Step 2: Starting GCloud extract job');
    
    console.log('DEBUG - Bearer token status:', {
      hasToken: !!GCLOUD_API_TOKEN,
      tokenLength: GCLOUD_API_TOKEN?.length || 0,
      tokenStart: GCLOUD_API_TOKEN?.substring(0, 10) + '...' || 'No token',
      baseUrl: GCLOUD_BASE_URL
    });
    
    if (!GCLOUD_API_TOKEN) {
      console.error('GCLOUD_API_TOKEN not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error - missing authentication token',
        },
        { status: 500 }
      );
    }

    let jobId;
    try {
      const jobStartPayload = {
        endpoint: '/api/v1/extract',
        payload: extractPayload,
      };
      
      console.log('DEBUG - Job start payload being sent to GCloud:', JSON.stringify(jobStartPayload, null, 2));
      
      const jobStartResponse = await fetch(`${GCLOUD_BASE_URL}/api/v1/jobs/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GCLOUD_API_TOKEN}`,
        },
        body: JSON.stringify(jobStartPayload),
      });

      if (!jobStartResponse.ok) {
        const errorText = await jobStartResponse.text();
        console.error(`GCloud job start failed: ${jobStartResponse.status} - ${errorText}`);
        
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to start data extraction job',
          },
          { status: jobStartResponse.status >= 500 ? 500 : 400 }
        );
      }

      const jobStartResult = await jobStartResponse.json();
      jobId = jobStartResult.jobId;
      console.log('GCloud job started successfully:', jobId);
    } catch (error: any) {
      console.error('Error starting GCloud job:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to start background data extraction',
        },
        { status: 500 }
      );
    }

    // Step 3: Poll for job completion
    console.log('Next.js API route - Step 3: Polling for job completion');
    
    const maxAttempts = 150; // 5 minutes at 2-second intervals
    const maxErrorRetries = 3; // Max retries for recoverable errors
    let attempts = 0;
    let consecutiveErrors = 0;
    let finalResult;

    while (attempts < maxAttempts) {
      try {
        // Check job status
        const statusResponse = await fetch(`${GCLOUD_BASE_URL}/api/v1/jobs/${jobId}/status`, {
          headers: {
            'Authorization': `Bearer ${GCLOUD_API_TOKEN}`,
          },
        });

        if (!statusResponse.ok) {
          // Handle non-recoverable errors
          if (statusResponse.status === 404) {
            console.error(`Job ${jobId} not found (404)`);            
            return NextResponse.json(
              {
                success: false,
                error: 'Job not found - it may have expired or been deleted',
              },
              { status: 404 }
            );
          }
          
          if (statusResponse.status === 401 || statusResponse.status === 403) {
            console.error(`Authentication failed for job ${jobId}: ${statusResponse.status}`);
            return NextResponse.json(
              {
                success: false,
                error: 'Authentication failed - please check API credentials',
              },
              { status: statusResponse.status }
            );
          }
          
          if (statusResponse.status === 400) {
            console.error(`Bad request for job ${jobId}`);
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid job ID format',
              },
              { status: 400 }
            );
          }
          
          // Handle recoverable errors with retry limit
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }
        
        // Reset error counter on successful request
        consecutiveErrors = 0;

        const status = await statusResponse.json();
        console.log(`Job ${jobId} status: ${status.status} (${status.progress || 0}%)`);

        if (status.status === 'completed') {
          // Get final results
          const resultResponse = await fetch(`${GCLOUD_BASE_URL}/api/v1/jobs/${jobId}/result`, {
            headers: {
              'Authorization': `Bearer ${GCLOUD_API_TOKEN}`,
            },
          });

          if (!resultResponse.ok) {
            throw new Error(`Failed to get results: ${resultResponse.status}`);
          }

          const resultData = await resultResponse.json();
          finalResult = resultData.data;
          
          console.log('DEBUG - Raw job result from GCloud:', JSON.stringify(resultData, null, 2));
          console.log('DEBUG - Final result data structure:', {
            type: typeof finalResult,
            keys: Object.keys(finalResult || {}),
            hasSuccess: 'success' in (finalResult || {}),
            hasData: 'data' in (finalResult || {}),
            hasTabs: 'tabs' in (finalResult || {})
          });
          
          console.log('GCloud job completed successfully');
          break;
        }

        if (status.status === 'failed') {
          console.error(`Job ${jobId} failed: ${status.message || 'Unknown error'}`);
          return NextResponse.json(
            {
              success: false,
              error: `Data extraction failed: ${status.message || 'Unknown error'}`,
            },
            { status: 500 }
          );
        }

        if (status.status === 'expired') {
          console.error(`Job ${jobId} expired`);
          return NextResponse.json(
            {
              success: false,
              error: 'Data extraction took too long and expired',
            },
            { status: 408 }
          );
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error: any) {
        consecutiveErrors++;
        console.error(`Poll attempt ${attempts + 1} failed (${consecutiveErrors}/${maxErrorRetries}):`, error.message);
        
        // Stop if we've hit the error retry limit
        if (consecutiveErrors >= maxErrorRetries) {
          console.error(`Stopping after ${maxErrorRetries} consecutive errors`);
          return NextResponse.json(
            {
              success: false,
              error: `Job status check failed after ${maxErrorRetries} retries: ${error.message}`,
            },
            { status: 500 }
          );
        }
        
        attempts++;
        
        if (attempts >= maxAttempts) {
          return NextResponse.json(
            {
              success: false,
              error: 'Data extraction polling timed out after maximum attempts',
            },
            { status: 500 }
          );
        }
        
        // Wait before retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, consecutiveErrors - 1), 5000);
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    if (!finalResult) {
      console.error(`Job ${jobId} did not complete within ${maxAttempts} attempts`);
      return NextResponse.json(
        {
          success: false,
          error: 'Data extraction timed out - please try again',
        },
        { status: 408 }
      );
    }

    // Step 4: Transform the result to match existing format
    console.log('Next.js API route - Step 4: Transforming results');
    
    console.log('DEBUG - Data before transformation:', {
      type: typeof finalResult,
      isNull: finalResult === null,
      isUndefined: finalResult === undefined,
      keys: finalResult ? Object.keys(finalResult) : 'no keys available',
      stringified: JSON.stringify(finalResult, null, 2)
    });
    
    const transformedData = transformZohoResponse(finalResult);
    
    console.log('DEBUG - Data after transformation:', {
      type: typeof transformedData,
      hasClientInfo: !!transformedData?.client_info,
      hasTabs: !!transformedData?.tabs,
      tabCount: transformedData?.tabs?.length || 0,
      stringified: JSON.stringify(transformedData, null, 2)
    });
    
    console.log('Next.js API route - Data transformed successfully:', 
      `${transformedData?.tabs?.length || 0} tabs with ${transformedData?.tabs?.reduce((acc, tab) => acc + tab.data.length, 0) || 0} total items`);

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