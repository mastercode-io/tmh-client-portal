'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Table,
  Text,
  Badge,
  Tooltip,
  ScrollArea,
  Box,
} from '@mantine/core';
import {
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RowItem, TableConfig } from '@/lib/types';
import { ImageCell } from './ImageCell';
import { ExpandableCell } from './ExpandableCell';
import { generateConfigFromData } from '@/lib/tableConfig';
import { formatDate } from '@/lib/utils';

interface DataTableProps {
  data: RowItem[];
  loading?: boolean;
  className?: string;
  config?: TableConfig; // New prop for configuration
}

interface ScrollIndicatorState {
  showLeft: boolean;
  showRight: boolean;
}

type SortField = keyof RowItem;
type SortDirection = 'asc' | 'desc';

export default function DataTable({
  data,
  loading = false,
  className,
  config
}: DataTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<any>(null);
  const [scrollIndicators, setScrollIndicators] = useState<ScrollIndicatorState>({
    showLeft: false,
    showRight: false
  });
  // Use provided config or generate one from data
  const tableConfig = useMemo(() => {
    if (config) return config;
    return generateConfigFromData(data);
  }, [data, config]);

  // Use config for initial state
  const [sortField, setSortField] = useState<SortField | null>(
    tableConfig.defaultSort?.field || null
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    tableConfig.defaultSort?.direction || 'desc'
  );
  const [criteriaFilter] = useState<string[]>([]);
  const [classificationFilter] = useState<string[]>([]);

  // Scroll detection logic
  const checkScrollIndicators = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    const tableContainer = tableContainerRef.current;
    
    if (!scrollArea || !tableContainer) {
      return;
    }

    // Try multiple selectors for the viewport
    let viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) {
      viewport = scrollArea.querySelector('.mantine-ScrollArea-viewport');
    }
    if (!viewport) {
      viewport = scrollArea.querySelector('[data-scrollarea-viewport]');
    }
    if (!viewport) {
      // Fallback to the scrollArea itself
      viewport = scrollArea;
    }

    const { scrollLeft, scrollWidth, clientWidth } = viewport;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    
    // Debug logging for troubleshooting (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Scroll detection debug:', {
        viewportFound: !!viewport,
        viewportSelector: viewport.getAttribute('data-radix-scroll-area-viewport') ? 'radix' : 
                         viewport.className?.includes('mantine-ScrollArea-viewport') ? 'mantine' :
                         viewport === scrollArea ? 'fallback' : 'unknown',
        scrollLeft,
        scrollWidth,
        clientWidth,
        canScrollLeft,
        canScrollRight,
        hasOverflow: scrollWidth > clientWidth
      });
    }

    setScrollIndicators({
      showLeft: canScrollLeft,
      showRight: canScrollRight && scrollWidth > clientWidth
    });
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    // Try multiple selectors for the viewport
    let viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) {
      viewport = scrollArea.querySelector('.mantine-ScrollArea-viewport');
    }
    if (!viewport) {
      viewport = scrollArea.querySelector('[data-scrollarea-viewport]');
    }
    if (!viewport) {
      // Fallback to the scrollArea itself
      viewport = scrollArea;
    }

    // Multiple timing checks to catch different render phases
    const timer1 = setTimeout(() => {
      checkScrollIndicators();
    }, 50);

    const timer2 = setTimeout(() => {
      checkScrollIndicators();
    }, 150);

    const timer3 = setTimeout(() => {
      checkScrollIndicators();
    }, 300);

    const timer4 = setTimeout(() => {
      checkScrollIndicators();
    }, 600);

    // Check on next animation frame to ensure layout is complete
    const animationFrame = requestAnimationFrame(() => {
      checkScrollIndicators();
    });

    // Add ResizeObserver to detect when table content changes size
    const resizeObserver = new ResizeObserver(() => {
      checkScrollIndicators();
    });

    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      resizeObserver.observe(tableContainer);
    }

    // Add scroll listener to the viewport
    viewport.addEventListener('scroll', checkScrollIndicators);
    
    // Add resize listener to window
    window.addEventListener('resize', checkScrollIndicators);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', checkScrollIndicators);
      window.removeEventListener('resize', checkScrollIndicators);
    };
  }, [checkScrollIndicators, data]);

  // Get visible columns from config
  const visibleColumns = useMemo(() => {
    return tableConfig.columns.filter(col => col.visible);
  }, [tableConfig.columns]);


  // Helper function for consistent value comparison
  const compareValues = (aValue: any, bValue: any, direction: SortDirection) => {
    // Equal values
    if (aValue === bValue) return 0;
    
    // Handle null/undefined values - but don't prioritize rows with images
    // This is the key fix for the image sorting issue
    if (aValue === null || aValue === undefined) {
      if (bValue === null || bValue === undefined) return 0;
      return direction === 'asc' ? 1 : -1;
    }
    if (bValue === null || bValue === undefined) {
      return direction === 'asc' ? -1 : 1;
    }
    
    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return direction === 'asc' ? comparison : -comparison;
    }
    
    // Numeric/other comparison
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return direction === 'asc' ? comparison : -comparison;
  };

  // Apply filters to the data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Apply criteria filter if active
      if (criteriaFilter.length > 0 && item.search_criteria) {
        if (!criteriaFilter.includes(item.search_criteria as string)) {
          return false;
        }
      }
      
      // Apply classification filter if active
      if (classificationFilter.length > 0 && item.classification) {
        if (!classificationFilter.includes(item.classification as string)) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, criteriaFilter, classificationFilter]);

  const sortedData = useMemo(() => {
    if (sortField) {
      return filteredData.sort((a, b) => {
        // Get values for sorting
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle special cases for certain fields
        if (sortField === 'image') {
          // For image field, we'll sort by search_term instead
          return compareValues(a['search_term'], b['search_term'], sortDirection);
        }

        // Handle standard comparison
        return compareValues(aValue, bValue, sortDirection);
      });
    }

    return filteredData;
  }, [filteredData, sortField, sortDirection]);

  // Additional effect to check scroll indicators when table data is ready
  useEffect(() => {
    if (sortedData.length > 0) {
      // Small delay to ensure table has rendered with the new data
      const timer = setTimeout(() => {
        checkScrollIndicators();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [sortedData, checkScrollIndicators]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCriteriaColor = (criteria: string) => {
    const colors: Record<string, string> = {
      'Identical': 'red',
      'Similar': 'orange',
      'Phonetic': 'blue',
      'Broad': 'green',
    };
    return colors[criteria] || 'gray';
  };

  // Helper function to detect Excel error values
  const isExcelError = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const excelErrors = ['#VALUE!', '#ERROR!', '#REF!', '#NAME?', '#DIV/0!', '#N/A', '#NULL!', '#NUM!'];
    return excelErrors.includes(value);
  };

  // Helper function to detect problematic object values
  const isProblematicValue = (value: any): boolean => {
    // Check for objects that would stringify to [object Object]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const stringified = String(value);
      return stringified === '[object Object]';
    }
    
    // Check for empty arrays
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    
    return false;
  };

  // Helper function to render the appropriate cell based on column key
  const renderCell = (item: RowItem, columnKey: string) => {
    // Find the column config for this key
    const columnConfig = tableConfig.columns.find(col => col.key === columnKey);
    
    if (columnKey === 'image' && item.image) {
      return (
        <ImageCell 
          src={item.image} 
          alt={`Image for ${item.mark_text || item.app_number || 'item'}`}
          width={columnConfig?.width || tableConfig.imageCell.width}
          height={tableConfig.imageCell.height}
          modalSize={tableConfig.imageCell.modalSize}
        />
      );
    }
    
    const value = item[columnKey];
    
    // Handle different data types
    if (value === null || value === undefined) {
      return <Text size="sm" c="dimmed">—</Text>;
    }
    
    // Handle Excel error values
    if (isExcelError(value)) {
      return <Text size="sm" c="dimmed">N/A</Text>;
    }
    
    // Handle problematic object values and empty arrays
    if (isProblematicValue(value)) {
      return <Text size="sm" c="dimmed">N/A</Text>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (columnKey === 'search_criteria' && typeof value === 'string') {
      return (
        <Badge
          color={getCriteriaColor(value)}
          variant="light"
          size="sm"
        >
          {value}
        </Badge>
      );
    }
    
    // Handle dates
    if (typeof value === 'string' && value.includes('GMT')) {
      // Try to format as date if it looks like a date string
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return formatDate(date.toISOString());
        }
      } catch (e) {
        // If date parsing fails, return as is
      }
    }
    
    // Handle long text with expandable cell
    if (typeof value === 'string' && 
        columnConfig?.maxLength && 
        value.length > columnConfig.maxLength && 
        columnConfig.expandable) {
      return (
        <ExpandableCell 
          content={value} 
          maxLength={columnConfig.maxLength}
          width={columnConfig.width}
        />
      );
    }
    
    // Default rendering with consistent tooltip behavior
    const textValue = String(value);
    
    // Show tooltip for any text that could potentially be truncated
    return (
      <Tooltip label={textValue} withArrow disabled={textValue.length <= 15}>
        <Text 
          size="sm" 
          style={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            display: 'block'
          }}
        >
          {textValue}
        </Text>
      </Tooltip>
    );
  };

  if (loading) {
    return (
        <div className={cn('p-6 flex flex-col', className)}>
          <div className="flex items-center justify-center h-64">
            <Text size="sm" c="dimmed">Loading table data...</Text>
          </div>
        </div>
    );
  }

  return (
      <div className={cn('flex flex-col h-full', className)}>
          {/* Table with ScrollArea taking full height */}
          <div className="flex-1 relative min-h-0">
            {/* Scroll Indicators - perfectly aligned with table header */}
            {scrollIndicators.showLeft && (
              <div className="absolute left-0 top-0 z-20 pointer-events-none">
                <div className="bg-[#6c7d8c] border-r border-gray-300 h-[36px] flex items-center px-2 shadow-sm">
                  <ChevronLeft size={16} className="text-white" />
                </div>
              </div>
            )}
            
            {scrollIndicators.showRight && (
              <div className="absolute right-0 top-0 z-20 pointer-events-none">
                <div className="bg-[#6c7d8c] border-l border-gray-300 h-[36px] flex items-center px-2 shadow-sm">
                  <ChevronRight size={16} className="text-white" />
                </div>
              </div>
            )}
            
            <ScrollArea 
              className="h-full w-full" 
              type="always" 
              offsetScrollbars 
              scrollbarSize={8}
              ref={scrollAreaRef}
              style={{ height: '100%' }}
            >
            <div className="min-w-max" ref={tableContainerRef}>
              <Table
                  highlightOnHover
                  stickyHeader
                  stickyHeaderOffset={0}
                  classNames={{ thead: 'bg-[#6c7d8c] text-white' }}
              >
                <Table.Thead>
                  <Table.Tr>
                    {visibleColumns.map(column => (
                      <Table.Th 
                        key={String(column.key)}
                        onClick={() => column.sortable ? handleSort(column.key as SortField) : null}
                        style={{ 
                          cursor: column.sortable ? 'pointer' : 'default',
                          width: column.width ? `${column.width}px` : 'auto',
                          minWidth: column.width ? `${column.width}px` : 'auto',
                          maxWidth: column.width ? `${column.width}px` : 'auto',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{column.header}</span>
                          {column.sortable && sortField === column.key && (
                            <span>
                              {sortDirection === 'asc' ? (
                                <IconSortAscending size={16} />
                              ) : (
                                <IconSortDescending size={16} />
                              )}
                            </span>
                          )}
                        </div>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedData.map((item) => (
                    <Table.Tr key={item.id}>
                      {visibleColumns.map(column => (
                        <Table.Td 
                          key={`${item.id}-${String(column.key)}`}
                          style={{
                            width: column.width ? `${column.width}px` : 'auto',
                            maxWidth: column.width ? `${column.width}px` : 'auto',
                            padding: '8px',
                            verticalAlign: 'top'
                          }}
                        >
                          {renderCell(item, column.key)}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </ScrollArea>
          
          
          {sortedData.length === 0 && (
            <Box className="absolute inset-0 flex items-center justify-center">
              <Text size="sm" c="dimmed">
                No data available.
              </Text>
            </Box>
          )}
        </div>
      </div>
  );
}