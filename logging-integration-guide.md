# Logging System Integration Guide

## Overview
The logging system provides structured logging with file output for local development and configurable levels for production, without modifying existing working code.

## Configuration

### Environment Variables
Add to your `.env.local` file:

```bash
# Logging configuration
LOG_LEVEL=debug          # error|warn|info|debug|trace
LOG_TO_FILE=true         # Enable file logging (local dev only)
LOG_DIR=logs             # Log directory (optional)
```

### Log Levels
- **`error`** - Only errors (production default)
- **`warn`** - Errors and warnings
- **`info`** - Basic job progress (development default)
- **`debug`** - Full debug including JSON payloads
- **`trace`** - Everything including intermediate steps

## Usage Examples

### Basic Integration (Additive Approach)
Add logging alongside existing console.log statements:

```typescript
import { logger } from '@/lib/logger';

// Existing code stays exactly the same
console.log('Job started:', jobId);

// New logging added alongside (optional)
logger.jobStart(jobId, requestId);
```

### API Request Logging
```typescript
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = 'req_' + Date.now();
  const startTime = Date.now();
  
  // Log API start
  logger.apiStart(requestId, '/api/client-data');
  
  try {
    // Your existing code here...
    
    // Log successful completion
    logger.apiEnd(requestId, '/api/client-data', Date.now() - startTime);
    return response;
  } catch (error) {
    logger.error('API request failed', error, { requestId });
    throw error;
  }
}
```

### Job Processing Logging
```typescript
// Log job creation
logger.jobStart(jobId, requestId);

// Log payloads (only to file, never console)
logger.logPayload('zoho-response', extractPayload, requestId);
logger.logPayload('job-start-payload', jobStartPayload, requestId, jobId);

// Log job progress
logger.jobStatus(jobId, 'running', 45, requestId);

// Log completion
logger.jobComplete(jobId, requestId);
```

### Error Logging
```typescript
// Errors (always shown in console + file)
logger.error('Job failed', { error: error.message, jobId }, { requestId });

// Warnings (shown in console + file)
logger.warn('Retry attempt failed', { attempt: 2, maxRetries: 3 });

// Info (console in dev, file always)
logger.info('Processing started', null, { requestId });

// Debug (file only, never console)
logger.debug('Intermediate result', { data: processedData });
```

## Example Integration: Client Data API

Here's how to add logging to your existing API without breaking anything:

```typescript
// At the top of your API route
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = 'req_' + Date.now();
  const startTime = Date.now();
  
  // Existing code
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  console.log('Next.js API route - client-data - Request ID:', id);
  
  // New logging (additive)
  logger.apiStart(requestId, '/api/client-data');
  
  try {
    // Step 1: Zoho API call (existing code unchanged)
    console.log('Next.js API route - Step 1: Calling Zoho API for request_id:', id);
    
    const zohoResponse = await fetch(zohoApiUrl...);
    const extractPayload = JSON.parse(responseText);
    
    // Existing debug log
    console.log('DEBUG - Raw Zoho API response (extract payload):', JSON.stringify(extractPayload, null, 2));
    
    // New logging (payload to file only)
    logger.logPayload('zoho-response', extractPayload, requestId);
    
    // Step 2: Start job (existing code unchanged)
    console.log('Next.js API route - Step 2: Starting GCloud extract job');
    
    const jobStartResponse = await fetch(`${GCLOUD_BASE_URL}/api/v1/jobs/start`, ...);
    const jobStartResult = await jobStartResponse.json();
    const jobId = jobStartResult.jobId;
    
    // Existing log
    console.log('GCloud job started successfully:', jobId);
    
    // New logging
    logger.jobStart(jobId, requestId);
    logger.logPayload('job-start-payload', jobStartPayload, requestId, jobId);
    
    // Step 3: Polling (existing code unchanged)
    while (attempts < maxAttempts) {
      const status = await statusResponse.json();
      
      // Existing log
      console.log(`Job ${jobId} status: ${status.status} (${status.progress || 0}%)`);
      
      // New logging
      logger.jobStatus(jobId, status.status, status.progress, requestId);
      
      if (status.status === 'completed') {
        // Existing logs
        console.log('GCloud job completed successfully');
        
        // New logging
        logger.jobComplete(jobId, requestId);
        logger.logPayload('job-result', finalResult, requestId, jobId);
        break;
      }
    }
    
    // Success
    logger.apiEnd(requestId, '/api/client-data', Date.now() - startTime);
    return NextResponse.json({ success: true, data: transformedData });
    
  } catch (error) {
    logger.error('API request failed', error, { requestId });
    return NextResponse.json({ success: false, error: error.message });
  }
}
```

## Local Development Behavior

### Console Output (Clean)
```
[INFO] API request started: /api/client-data
[INFO] Job started: job_1690123456789_abc123
[INFO] Job completed: job_1690123456789_abc123
[INFO] API request completed: /api/client-data (45230ms)
```

### File Output (Detailed)
`logs/client-data-2024-01-24.log`:
```
[2024-01-24T15:25:00.123Z] INFO: API request started: /api/client-data [req:12345678...]
[2024-01-24T15:25:00.234Z] DEBUG: Payload: zoho-response [req:12345678...]
{
  "sharepoint_excel_url": "https://...",
  "sheet_names": ["Google", "Domains", ...],
  "config": { ... }
}
[2024-01-24T15:25:01.456Z] INFO: Job started: job_1690123456789_abc123 [req:12345678...] [job:job_1690123456789_abc123]
[2024-01-24T15:25:01.567Z] DEBUG: Payload: job-start-payload [req:12345678...] [job:job_1690123456789_abc123]
{
  "endpoint": "/api/v1/extract",
  "payload": { ... }
}
[2024-01-24T15:25:03.789Z] DEBUG: Job status: running [req:12345678...] [job:job_1690123456789_abc123]
{ "progress": 45 }
[2024-01-24T15:25:45.234Z] INFO: Job completed: job_1690123456789_abc123 [req:12345678...] [job:job_1690123456789_abc123]
[2024-01-24T15:25:45.345Z] DEBUG: Payload: job-result [req:12345678...] [job:job_1690123456789_abc123]
{ "data": { ... } }
[2024-01-24T15:25:45.456Z] INFO: API request completed: /api/client-data (45230ms) [req:12345678...]
```

## Production Behavior

### Environment Variables
```bash
NODE_ENV=production
LOG_LEVEL=info          # Reduce noise
LOG_TO_FILE=false       # No file system access
```

### Console Output (Structured JSON)
```json
{"timestamp":"2024-01-24T15:25:00.123Z","level":"info","message":"API request started: /api/client-data","requestId":"req_1690123456789"}
{"timestamp":"2024-01-24T15:25:01.456Z","level":"info","message":"Job started: job_1690123456789_abc123","jobId":"job_1690123456789_abc123","requestId":"req_1690123456789"}
```

## Benefits

1. **Non-intrusive**: Existing code continues working unchanged
2. **Configurable**: Control what gets logged where via environment variables
3. **Clean console**: Essential info only, detailed logs in files
4. **Production ready**: Structured JSON logs for log aggregation services
5. **Automatic rotation**: Prevents log files from growing too large
6. **Request tracking**: Correlate logs across the entire request lifecycle

## Log Analysis

### Find specific request
```bash
grep "req_1690123456789" logs/client-data-2024-01-24.log
```

### Find job failures
```bash
grep "ERROR.*job" logs/client-data-2024-01-24.log
```

### View payloads for debugging
```bash
grep -A 10 "Payload: zoho-response" logs/client-data-2024-01-24.log
```

This system gives you comprehensive debugging information without cluttering the console or breaking existing functionality.