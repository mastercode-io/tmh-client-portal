'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ClientData, UseClientDataReturn, JobProcessingStatus } from '@/lib/types';

// Track active requests to prevent duplicates
const activeRequests = new Map<string, Promise<any>>();

export function useClientData(requestId: string | null): UseClientDataReturn {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<JobProcessingStatus | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!requestId) {
      setData(null);
      setError('No request ID provided');
      setLoading(false);
      return;
    }
    
    // Clear any previous error when we have a valid requestId
    setError(null);

    // Check if there's already an active request for this ID
    const existingRequest = activeRequests.get(requestId);
    if (existingRequest) {
      console.log('useClientData - Request already in progress for:', requestId);
      try {
        await existingRequest;
      } catch (err) {
        // The existing request failed, we'll proceed with a new one
        console.log('useClientData - Existing request failed, starting new request');
      }
      return;
    }

    // Cancel any previous request from this hook instance
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);
    setProcessingStatus({
      phase: 'initializing',
      message: 'Initializing data request...'
    });

    console.log('useClientData - Fetching data for request ID:', requestId);

    // Create the promise for this request
    const requestPromise = (async () => {

    try {
      setProcessingStatus({
        phase: 'getting_parameters',
        message: 'Getting extraction parameters from Zoho...'
      });

      const params = new URLSearchParams({ id: requestId });
      const url = `/api/client-data?${params.toString()}`;
      console.log('useClientData - Fetch URL:', url);
      
      // Start the request with enhanced progress tracking
      const startTime = Date.now();
      let lastProgressUpdate = startTime;
      
      // Create a timeout to update processing status during long requests
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed > 5000 && elapsed < 30000) {
          setProcessingStatus({
            phase: 'processing',
            message: 'Processing Excel file in background...',
            progress: Math.min(Math.floor((elapsed - 5000) / 600), 80) // Estimate progress up to 80%
          });
        } else if (elapsed >= 30000) {
          setProcessingStatus({
            phase: 'finalizing',
            message: 'Finalizing results...',
            progress: 90
          });
        }
      }, 2000);
      
      const response = await fetch(url, {
        signal: abortController.signal
      });
      clearInterval(progressInterval);
      
      if (!response.ok) {
        // Enhanced error messages based on status code
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
      
      setProcessingStatus({
        phase: 'finalizing',
        message: 'Processing completed, preparing data...',
        progress: 95
      });
      
      const result = await response.json();
      console.log('useClientData - API Response:', {
        success: result.success,
        hasData: !!result.data,
        tabCount: result.data?.tabs?.length,
        itemCount: result.data?.tabs?.reduce((acc: number, tab: any) => acc + tab.data.length, 0)
      });
      
      if (result.success) {
        setProcessingStatus({
          phase: 'completed',
          message: 'Data loaded successfully',
          progress: 100
        });
        
        setData(result.data);
        
        // Clear processing status after a brief delay
        setTimeout(() => {
          setProcessingStatus(undefined);
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      
      // Handle abort separately
      if (err.name === 'AbortError') {
        console.log('useClientData - Request aborted');
        return;
      }
      
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('useClientData - Error:', message);
      setError(message);
      setData(null);
      setProcessingStatus(undefined);
    } finally {
      setLoading(false);
      // Remove from active requests
      activeRequests.delete(requestId);
    }
    })();

    // Store the promise to prevent duplicate requests
    activeRequests.set(requestId, requestPromise);
    
    try {
      await requestPromise;
    } catch (err) {
      // Error already handled in the inner try-catch
    }
  }, [requestId]);

  useEffect(() => {
    fetchData();
    
    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    console.log('useClientData - Refetching data');
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    processingStatus,
  };
}