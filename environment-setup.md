# Environment Setup for Google Cloud Job Queue Integration

## Required Environment Variables

### Netlify Environment Variables
Add these variables in your Netlify dashboard under **Site Settings → Environment Variables**:

```
GCLOUD_BASE_URL=https://us-central1-excel-pptx-merger.cloudfunctions.net/excel-pptx-merger
GCLOUD_API_TOKEN=your-bearer-token-here
```

### Setting Up Environment Variables

#### Option 1: Netlify Dashboard (Recommended)
1. Go to your Netlify site dashboard
2. Navigate to **Site Settings**
3. Click on **Environment Variables** in the left sidebar
4. Click **Add Variable**
5. Add each variable:
   - **Key**: `GCLOUD_BASE_URL`
   - **Value**: `https://us-central1-excel-pptx-merger.cloudfunctions.net/excel-pptx-merger`
   - **Scope**: All deployments
   
   - **Key**: `GCLOUD_API_TOKEN`
   - **Value**: `[Your actual Bearer token]`
   - **Scope**: All deployments

#### Option 2: Netlify CLI
```bash
netlify env:set GCLOUD_BASE_URL "https://us-central1-excel-pptx-merger.cloudfunctions.net/excel-pptx-merger"
netlify env:set GCLOUD_API_TOKEN "your-bearer-token-here"
```

#### Option 3: Local Development (.env.local)
For local development, create a `.env.local` file in your project root:

```bash
# .env.local (for local development only)
GCLOUD_BASE_URL=https://us-central1-excel-pptx-merger.cloudfunctions.net/excel-pptx-merger
GCLOUD_API_TOKEN=your-bearer-token-here
```

**⚠️ Important**: Never commit the `.env.local` file to your repository. It's already included in `.gitignore`.

## Security Best Practices

### Bearer Token Security
- The `GCLOUD_API_TOKEN` should be treated as a sensitive secret
- Never expose it in client-side code or logs
- Use Netlify's environment variables for secure storage
- Consider rotating the token periodically

### Access Control
- Ensure the Bearer token has only the minimum required permissions
- Monitor API usage for any unusual activity
- Consider implementing IP restrictions if supported by your Google Cloud Function

## Testing the Setup

### Verify Environment Variables
You can test if the environment variables are properly set by checking the Netlify function logs:

1. Deploy your changes to Netlify
2. Test the `/api/client-data` endpoint with a valid request ID
3. Check the Netlify function logs for any authentication errors

### Common Issues and Solutions

#### 1. Environment Variables Not Loading
**Problem**: Function logs show "GCLOUD_API_TOKEN not configured"
**Solution**: 
- Verify the variable name is exactly `GCLOUD_API_TOKEN` (case-sensitive)
- Redeploy the site after adding environment variables
- Check that the variable scope is set to "All deployments"

#### 2. Authentication Errors
**Problem**: Getting 401 Unauthorized from Google Cloud Function
**Solution**:
- Verify the Bearer token is correct
- Ensure the token format includes no extra spaces or characters
- Check that the token hasn't expired

#### 3. Network Connectivity Issues
**Problem**: Connection timeouts to Google Cloud Function
**Solution**:
- Verify the `GCLOUD_BASE_URL` is correct
- Check if there are any firewall restrictions
- Test the URL directly in a browser or with curl

### Testing Commands

#### Test Google Cloud Function directly:
```bash
# Test with curl (replace YOUR_TOKEN with actual token)
curl -X POST "https://us-central1-excel-pptx-merger.cloudfunctions.net/excel-pptx-merger/api/v1/jobs/start" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/v1/extract",
    "payload": {
      "sharepoint_excel_url": "test-url",
      "sheet_names": ["Sheet1"],
      "config": {
        "global_settings": {
          "sharepoint": {
            "enabled": true,
            "tenant_id": "test-tenant"
          }
        }
      }
    }
  }'
```

#### Test job status:
```bash
# Replace JOB_ID with actual job ID from start response
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://us-central1-excel-pptx-merger.cloudfunctions.net/excel-pptx-merger/api/v1/jobs/JOB_ID/status"
```

## Deployment Workflow

1. **Set Environment Variables** in Netlify dashboard
2. **Deploy Changes** - Netlify will automatically rebuild with new environment variables
3. **Test Integration** - Use a real request ID to test the full workflow
4. **Monitor Logs** - Check Netlify function logs for any issues

## Backup and Recovery

### Environment Variable Backup
Keep a secure record of your environment variables:
- Store the Bearer token in a secure password manager
- Document the Google Cloud Function URL
- Keep a copy of these settings for disaster recovery

### Rollback Plan
If issues occur after deployment:
1. Check Netlify function logs for specific errors
2. Verify environment variables are correctly set
3. Test Google Cloud Function availability independently
4. Roll back to previous deployment if necessary using Netlify's rollback feature

## Monitoring and Maintenance

### Regular Checks
- Monitor Google Cloud Function usage and quotas
- Check for any authentication errors in logs
- Verify Bearer token hasn't expired
- Test the integration periodically with sample requests

### Performance Monitoring
- Track job completion times in Google Cloud Function
- Monitor Netlify function execution duration
- Watch for any timeout patterns or failures

This setup eliminates the 10-second timeout issue while maintaining secure authentication with your Google Cloud infrastructure.