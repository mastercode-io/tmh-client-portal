'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientData, MultiTabClientData, UseClientDataReturn } from '@/lib/types';

// Extended return type for multi-tab support
export interface UseMultiTabClientDataReturn extends Omit<UseClientDataReturn, 'data'> {
  data: ClientData | MultiTabClientData | null;
  isMultiTab: boolean;
}

export function useClientData(requestId: string | null, multiTab: boolean = false): UseMultiTabClientDataReturn {
  const [data, setData] = useState<ClientData | MultiTabClientData | null>(null);
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
    console.log('useClientData - Multi-tab mode:', multiTab);

    try {
      const params = new URLSearchParams({ id: requestId });
      if (multiTab) {
        params.append('multi_tab', 'true');
      }
      
      const url = `/api/client-data?${params.toString()}`;
      console.log('useClientData - Fetch URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('useClientData - API Response:', {
        success: result.success,
        hasData: !!result.data,
        isMultiTab: multiTab,
        tabCount: multiTab ? result.data?.tabs?.length : undefined,
        itemCount: multiTab 
          ? result.data?.tabs?.reduce((acc: number, tab: any) => acc + tab.data.length, 0) 
          : result.data?.search_data?.length || 0
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
  }, [requestId, multiTab]);

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
    isMultiTab: multiTab,
  };
}