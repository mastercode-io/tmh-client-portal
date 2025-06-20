'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientData, UseClientDataReturn } from '@/lib/types';

export function useClientData(requestId: string | null): UseClientDataReturn {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!requestId) {
      setError('No request ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    console.log('useClientData - Fetching data for request ID:', requestId);

    try {
      const url = `/api/client-data?id=${encodeURIComponent(requestId)}`;
      console.log('useClientData - Fetch URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('useClientData - API Response:', {
        success: result.success,
        hasData: !!result.data,
        itemCount: result.data?.search_data?.length || 0
      });
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('useClientData - Error:', message);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchData();
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
  };
}