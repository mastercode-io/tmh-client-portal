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

    try {
      const response = await fetch(`/api/client-data?id=${encodeURIComponent(requestId)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
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
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}