'use client';

import { useState, useMemo, useCallback } from 'react';
import { RowItem, TableSortState, TableFilterState, UseTableReturn } from '@/lib/types';
import { sortData } from '@/lib/utils';

export function useTable(data: RowItem[]): UseTableReturn {
  const [sortState, setSortState] = useState<TableSortState>({
    column: 'created_date',
    direction: 'desc',
  });

  const [filterState, setFilterState] = useState<TableFilterState>({
    search: '',
    criteria: [],
    classification: [],
  });

  const handleSort = useCallback((column: keyof RowItem) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleFilter = useCallback((filters: Partial<TableFilterState>) => {
    setFilterState(prev => ({ ...prev, ...filters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState({
      search: '',
      criteria: [],
      classification: [],
    });
  }, []);

  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (filterState.search.trim()) {
      result = result.filter(item => {
        const searchLower = filterState.search.toLowerCase();
        return item.search_term.toLowerCase().includes(searchLower) ||
               item.remarks.toLowerCase().includes(searchLower) ||
               item.classification.toLowerCase().includes(searchLower);
      });
    }

    // Apply criteria filter
    if (filterState.criteria.length > 0) {
      result = result.filter(item => 
        filterState.criteria.includes(item.search_criteria)
      );
    }

    // Apply classification filter
    if (filterState.classification.length > 0) {
      result = result.filter(item =>
        filterState.classification.some(filter =>
          item.classification.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    return result;
  }, [data, filterState]);

  const sortedData = useMemo(() => {
    if (!sortState.column) return filteredData;
    
    return sortData(filteredData, sortState.column, sortState.direction);
  }, [filteredData, sortState]);

  return {
    sortedData,
    filteredData,
    sortState,
    filterState,
    handleSort,
    handleFilter,
    resetFilters,
  };
}