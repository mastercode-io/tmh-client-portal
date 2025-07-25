# Google Cloud Job Queue Implementation

## Overview
This document outlines the implementation of a job queue system in your existing Google Cloud Function to handle long-running Zoho API calls. This solves the Netlify 10-second timeout issue by moving the heavy processing to Google Cloud's more generous compute limits.

## Architecture
```
Client → Netlify Function → GCloud /start-job → Background Processing
   ↓                             ↓
Poll Status ← Netlify ← GCloud /job-status (pending/running/completed)
   ↓
Get Results ← Netlify ← GCloud /job-result → Data + cleanup
```

## Required API Endpoints

### 1. POST /start-job
**Purpose**: Initiate a background job for Zoho API data fetching

**Request**:
```json
{
  "request_id": "gYBMF3kP7F7etcx3TScsGB+ulv6gRkP2ejFw6Asxf+NBY0CTIOoAniBhWkyd8l9P"
}
```

**Response** (immediate):
```json
{
  "success": true,
  "jobId": "job_1690123456789_abc123",
  "status": "started",
  "estimatedTime": "30-60 seconds"
}
```

**Implementation Notes**:
- Generate unique `jobId` using timestamp + random string
- Store job in memory/temp storage with initial status "pending"
- Start async processing (don't wait for completion)
- Return immediately to avoid timeout

### 2. GET /job-status/{jobId}
**Purpose**: Check the current status of a running job

**Response Examples**:
```json
// Job still processing
{
  "success": true,
  "jobId": "job_1690123456789_abc123",
  "status": "running", 
  "progress": 45,
  "message": "Fetching data from Zoho API..."
}

// Job completed
{
  "success": true,
  "jobId": "job_1690123456789_abc123",
  "status": "completed",
  "progress": 100,
  "message": "Data processing complete"
}

// Job failed
{
  "success": false,
  "jobId": "job_1690123456789_abc123",
  "status": "failed",
  "error": "Zoho API timeout",
  "message": "Request failed after 3 retry attempts"
}
```

**Status Values**:
- `pending` - Job created, not started
- `running` - Currently processing
- `completed` - Successfully finished
- `failed` - Error occurred
- `expired` - Job too old (>1 hour)

### 3. GET /job-result/{jobId}
**Purpose**: Retrieve completed job results and clean up storage

**Response** (success):
```json
{
  "success": true,
  "jobId": "job_1690123456789_abc123",
  "status": "completed",
  "data": {
    "tabs": [...],
    "metadata": {...}
  },
  "retrievedAt": "2024-07-24T15:30:00Z"
}
```

**Response** (job not ready):
```json
{
  "success": false,
  "jobId": "job_1690123456789_abc123",
  "status": "running",
  "error": "Job still processing",
  "message": "Use /job-status to check progress"
}
```

**Important**: This endpoint should **delete the job from storage** after successful retrieval to prevent memory leaks.

## Implementation Details

### Job Storage Structure
```python
# In-memory storage (or Redis/database)
jobs = {
    "job_1690123456789_abc123": {
        "id": "job_1690123456789_abc123",
        "request_id": "gYBMF3kP7F7etcx3TScsGB...",
        "status": "running",
        "progress": 45,
        "created_at": "2024-07-24T15:25:00Z",
        "updated_at": "2024-07-24T15:25:30Z",
        "data": None,  # Populated when complete
        "error": None,
        "retry_count": 0
    }
}
```

### Background Processing Logic
```python
async def process_job(job_id, request_id):
    try:
        # Update status to running
        jobs[job_id]["status"] = "running"
        jobs[job_id]["progress"] = 10
        
        # Call Zoho API (existing logic)
        zoho_url = f"https://www.zohoapis.com/crm/v7/functions/reportsverifyrequest/actions/execute?auth_type=apikey&zapikey=YOUR_KEY&request_id={request_id}"
        
        jobs[job_id]["progress"] = 50
        response = await fetch(zoho_url)
        
        jobs[job_id]["progress"] = 80
        data = await response.json()
        
        # Transform data (reuse existing adapter)
        transformed_data = transform_zoho_response(data)
        
        # Store result
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = 100
        jobs[job_id]["data"] = transformed_data
        jobs[job_id]["updated_at"] = datetime.now().isoformat()
        
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["updated_at"] = datetime.now().isoformat()
```

### Auto-Cleanup
```python
# Clean up old jobs (run periodically)
def cleanup_expired_jobs():
    current_time = datetime.now()
    expired_jobs = []
    
    for job_id, job in jobs.items():
        created_at = datetime.fromisoformat(job["created_at"])
        if (current_time - created_at).total_seconds() > 3600:  # 1 hour
            expired_jobs.append(job_id)
    
    for job_id in expired_jobs:
        del jobs[job_id]
```

## Error Handling

### Retry Logic
- Implement 3 retry attempts for failed Zoho API calls
- Use exponential backoff (1s, 2s, 4s delays)
- Update job status with retry information

### Timeout Handling
- Set maximum job processing time (5 minutes)
- Mark jobs as "failed" if they exceed timeout
- Provide clear error messages to client

### Edge Cases
- Handle duplicate job creation (same request_id)
- Validate job_id format in status/result endpoints
- Return appropriate HTTP status codes (404 for missing jobs)

## Integration with Existing Code

### Reuse Current Logic
- Keep existing Zoho API call logic
- Reuse `transformZohoResponse` function
- Maintain same error handling patterns

### Environment Variables
- Use existing `ZOHO_API_KEY` configuration
- Add optional `JOB_CLEANUP_INTERVAL` setting

## Testing Endpoints

### Test Job Creation
```bash
curl -X POST https://your-gcloud-function.com/start-job \
  -H "Content-Type: application/json" \
  -d '{"request_id": "test_request_123"}'
```

### Test Status Check
```bash
curl https://your-gcloud-function.com/job-status/job_1690123456789_abc123
```

### Test Result Retrieval
```bash
curl https://your-gcloud-function.com/job-result/job_1690123456789_abc123
```

## Security Considerations

### Rate Limiting
- Limit job creation to prevent abuse
- Maximum 10 concurrent jobs per IP/user

### Input Validation
- Sanitize `request_id` parameter
- Validate job_id format
- Prevent injection attacks

### CORS Configuration
- Allow requests from your Netlify domain
- Set appropriate CORS headers for all endpoints

## Deployment Checklist

- [ ] Add 3 new endpoint handlers
- [ ] Implement in-memory job storage
- [ ] Add background processing logic
- [ ] Set up auto-cleanup mechanism
- [ ] Configure CORS for Netlify domain
- [ ] Add proper error handling
- [ ] Test all endpoints
- [ ] Monitor memory usage
- [ ] Set up logging for job lifecycle

## Next Steps (for Netlify Integration)
1. Update `netlify/functions/client-data.ts` to call these endpoints
2. Modify `src/hooks/useClientData.ts` for polling pattern
3. Add loading states and progress indicators to UI
4. Test end-to-end flow with real data

This implementation will eliminate the 10-second timeout issue while providing a better user experience with progress tracking and reliable data fetching.