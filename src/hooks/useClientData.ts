'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientData, UseClientDataReturn, JobProcessingStatus } from '@/lib/types';
import { logger } from '@/lib/clientLogger';

export function useClientData(requestId: string | null): UseClientDataReturn {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<JobProcessingStatus | undefined>(undefined);

  useEffect(() => {
    // Don't do anything if no requestId
    if (!requestId) {
      setData(null);
      setError('No request ID provided');
      setLoading(false);
      return;
    }

    // Flag to handle React 18 Strict Mode double mount
    let isCancelled = false;
    const abortController = new AbortController();

    const fetchData = async () => {
      console.log('useClientData Debug - Starting API call for:', requestId);
      
      setLoading(true);
      setError(null);
      
      if (!isCancelled) {
        setProcessingStatus({
          phase: 'initializing',
          message: 'Initializing data request...'
        });
      }

      let progressInterval: NodeJS.Timeout | null = null;
      
      try {
        if (!isCancelled) {
          setProcessingStatus({
            phase: 'getting_parameters',
            message: 'Getting extraction parameters from Zoho...'
          });
        }

        const params = new URLSearchParams({ id: requestId });
        const url = `/api/client-data?${params.toString()}`;
        console.log('useClientData Debug - API Call Details:', {
          originalRequestId: requestId,
          urlParams: params.toString(),
          fullUrl: url,
          decodedParams: Object.fromEntries(params.entries())
        });
        
        // Start the request with enhanced progress tracking
        const startTime = Date.now();
        
        // Create a timeout to update processing status during long requests
        progressInterval = setInterval(() => {
          if (isCancelled) return;
          
          const elapsed = Date.now() - startTime;
          
          if (elapsed > 5000 && elapsed < 30000) {
            setProcessingStatus({
              phase: 'processing',
              message: 'Processing Excel file in background...',
              progress: Math.min(Math.floor((elapsed - 5000) / 600), 80)
            });
          } else if (elapsed >= 30000) {
            setProcessingStatus({
              phase: 'finalizing',
              message: 'Finalizing results...',
              progress: 90
            });
          }
        }, 2000);
        
        const fetchStartTime = Date.now();
        logger.logApiRequest('GET', url, {}, undefined, requestId);
        
        const response = await fetch(url, {
          signal: abortController.signal
        });
        
        const fetchDuration = Date.now() - fetchStartTime;
        if (progressInterval) clearInterval(progressInterval);
        
        logger.logApiResponse('GET', url, response.status, fetchDuration, undefined, requestId);
        
        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          
          if (response.status === 408) {
            errorMessage = 'Request timed out - the data extraction is taking longer than expected';
          } else if (response.status === 502) {
            errorMessage = 'Server temporarily unavailable - please try again';
          } else if (response.status >= 500) {
            errorMessage = 'Server error occurred - please try again in a few moments';
          }
          
          throw new Error(errorMessage);
        }
        
        if (!isCancelled) {
          setProcessingStatus({
            phase: 'finalizing',
            message: 'Processing completed, preparing data...',
            progress: 95
          });
        }
        
        const result = await response.json();
        console.log('useClientData Debug - Complete API Response:', {
          success: result.success,
          hasData: !!result.data,
          tabCount: result.data?.tabs?.length,
          itemCount: result.data?.tabs?.reduce((acc: number, tab: any) => acc + tab.data.length, 0),
          error: result.error,
          fullResult: result
        });
        
        // Only update state if not cancelled (React 18 Strict Mode protection)
        if (!isCancelled) {
          if (result.success) {
            setProcessingStatus({
              phase: 'completed',
              message: 'Data loaded successfully',
              progress: 100
            });
            
            setData(result.data);
            
            // Clear processing status after a brief delay
            setTimeout(() => {
              if (!isCancelled) {
                setProcessingStatus(undefined);
              }
            }, 1500);
          } else {
            throw new Error(result.error || 'Failed to fetch data');
          }
        }
      } catch (err: any) {
        if (progressInterval) clearInterval(progressInterval);
        
        // Handle abort separately - don't update state if cancelled
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          console.log('useClientData Debug - Request aborted for:', requestId);
          return;
        }
        
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred';
          console.error('useClientData Debug - Error for:', requestId, message);
          setError(message);
          setData(null);
          setProcessingStatus(undefined);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function for React 18 Strict Mode
    return () => {
      console.log('useClientData Debug - Cleaning up request for:', requestId);
      isCancelled = true;
      abortController.abort();
    };
  }, [requestId]);

  const refetch = useCallback(() => {
    console.log('useClientData Debug - Manual refetch triggered');
    // Clear current data to show loading state
    setData(null);
    setError(null);
    // The useEffect will re-run because we're not changing requestId
    // We can trigger a re-render by temporarily changing state
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    processingStatus,
  };
}