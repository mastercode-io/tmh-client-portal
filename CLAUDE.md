# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Related Documentation Files
For additional context and implementation details, refer to:
- `environment-setup.md` - Google Cloud API authentication and environment configuration
- `logging-integration-guide.md` - Structured logging system usage and examples
- `gcloud-job-queue-implementation.md` - Google Cloud job queue system documentation
- `logs/` directory - Local development debug logs (git-ignored)

## Common Commands

### Development
- `npm run dev` - Start development server on port 3847
- `netlify dev` - Start Netlify development server with functions (runs on port 8888, proxies to 3847)
- `npm run build` - Build for production
- `npm run start` - Start production server on port 3847
- `npm run export` - Build and export static files

### Testing
- `npm test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run test:e2e` - Run Playwright end-to-end tests

### Code Quality
- `npm run lint` - Run ESLint linting
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Architecture

### Core Stack
- **Next.js 14** with app router for full-stack React development
- **TypeScript** with strict mode enabled
- **Mantine v7.12.2** as the primary UI component library
- **Tailwind CSS** for utility-first styling
- **Netlify Functions** for serverless API endpoints

### Key Directories
- `src/app/` - Next.js 14 app router pages and API routes
- `src/components/` - Reusable React components organized by type (ui/, layout/, providers/)
- `src/lib/` - Core utilities, types, and business logic
- `src/hooks/` - Custom React hooks for data fetching and state management
- `netlify/functions/` - Serverless functions for production API endpoints

### Data Flow (Updated - Job Queue Integration)
1. URL parameters (`id` or `request_id`) determine client data to load
2. `useClientData` hook handles API requests with enhanced loading states and request deduplication
3. **NEW**: API routes use Google Cloud job queue for long-running data extraction:
   - Step 1: Call Zoho API to get extract job payload
   - Step 2: Start Google Cloud extract job via authenticated API
   - Step 3: Poll job status with proper error handling and retry limits
   - Step 4: Retrieve and transform final results
4. Data is transformed through `transformZohoResponse` to match internal types
5. `TabsContainer` component renders multi-tab client search results with sorting, filtering, and image display

### Important Type Definitions
Central type definitions are in `src/lib/types.ts`:
- `ClientData` - Main data structure for client information and search results
- `RowItem` - Flexible row structure supporting dynamic properties
- `TableConfig` - Configuration for table display and behavior
- `JobProcessingStatus` - **NEW**: Job progress tracking for enhanced UX
- `UseClientDataReturn` - **UPDATED**: Now includes processingStatus for job progress

### Mantine v7 Specific Notes
- Uses Mantine v7 API (significant changes from v6)
- Key component prop changes: `position` → `justify`, `icon` → `leftSection`
- Always reference official Mantine v7 documentation for component usage
- Theme system integrated with Tailwind CSS custom colors

### UI Component Patterns
- Always use Mantine v7 component APIs (leftSection/rightSection, justify vs position)
- Horizontal scroll detection: Use refs with scrollWidth vs clientWidth comparison
- Table modifications: Preserve existing sorting/filtering while updating layout
- Responsive indicators: Show UI hints when content extends beyond viewport

### Development Environment Detection
The application automatically detects environment:
- Development: Uses Next.js API routes at `/api/client-data`
- Production: Uses Netlify Functions at `/.netlify/functions/client-data`
- **Both environments now use the same Google Cloud job queue integration**

### Required Environment Variables
For Google Cloud job queue integration:
- `GCLOUD_BASE_URL` - Google Cloud Function base URL
- `GCLOUD_API_TOKEN` - Bearer token for Google Cloud API authentication

For logging system (optional):
- `LOG_LEVEL` - error|warn|info|debug|trace (default: info)
- `LOG_TO_FILE` - true|false (local dev only, default: false)

### TypeScript Configuration
- Strict mode enabled with `isolatedModules` for production builds
- Path alias `@/*` maps to `src/*`
- All type definitions should be centralized in `src/lib/types.ts`
- Use `export type` when re-exporting types due to `isolatedModules`

### Testing Setup
- Jest for unit testing with React Testing Library
- Playwright for end-to-end testing
- Tests located in `__tests__/` directory
- Pre-commit hooks with Husky and lint-staged ensure code quality

## Recent Major Updates

### React 18 Strict Mode Compatibility Fix (CRITICAL)
- **Problem**: URL parameter loading showed "No Data Found" due to component unmount/remount cycles
- **Root Cause**: React 18 Strict Mode intentionally unmounts/remounts components to test cleanup
- **Symptoms**: 
  - API requests getting aborted during development
  - "Component unmounting, aborting any active request" logs
  - Data fails to load despite correct URL parameters
- **Solution**: Proper useEffect cleanup with `isCancelled` flag pattern
- **Files Modified**: `src/hooks/useClientData.ts`, `src/app/page.tsx` (Suspense boundary)
- **Key Pattern**: Always use `isCancelled` flag + AbortController for React 18 compatibility
```typescript
useEffect(() => {
  let isCancelled = false;
  const abortController = new AbortController();
  
  const fetchData = async () => {
    // API call logic
    if (!isCancelled) {
      setState(data); // Only update if not cancelled
    }
  };
  
  fetchData();
  
  return () => {
    isCancelled = true;
    abortController.abort();
  };
}, [dependency]);
```

### Job Queue Integration (Timeout Solution)
- **Problem Solved**: Eliminated 10-second Netlify function timeout issues
- **Implementation**: Google Cloud job queue with polling pattern
- **Benefits**: Reliable data fetching, progress tracking, better error handling
- **Files Modified**: `netlify/functions/client-data.ts`, `src/app/api/client-data/route.ts`, `src/hooks/useClientData.ts`

### Enhanced Error Handling
- **Non-recoverable errors**: Stop immediately (404, auth failures, bad requests)
- **Recoverable errors**: Retry with exponential backoff (max 3 attempts)
- **Request deduplication**: Prevent duplicate jobs for same request ID
- **Proper cleanup**: AbortController and request tracking

### Next.js 14 App Router useSearchParams Integration
- **Issue**: Direct URL access with search params caused hydration mismatches
- **Solution**: Wrapped components using `useSearchParams()` in `<Suspense>` boundaries
- **Pattern**: Always wrap `useSearchParams()` components in Suspense to prevent CSR bailout
- **Files Modified**: `src/app/page.tsx`

### Structured Logging System
- **Location**: `src/lib/logger.ts` - Non-intrusive logging utility
- **Features**: Environment-based log levels, file output for dev, JSON for production
- **Usage**: Optional integration alongside existing console.log statements
- **Configuration**: Via LOG_LEVEL and LOG_TO_FILE environment variables

### Netlify Dev Configuration
- **Issue**: Port conflict between Netlify CLI and Next.js dev server
- **Solution**: Updated `netlify.toml` with correct port mapping (8888 → 3847)
- **Usage**: `netlify dev` now works seamlessly for local function testing