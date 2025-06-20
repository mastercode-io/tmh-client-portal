'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  Select,
  Group,
  Text,
  ActionIcon,
  Badge,
  Tooltip,
  ScrollArea,
  Stack,
  Button,
  Box,
} from '@mantine/core';
import {
  IconSortAscending,
  IconSortDescending,
  IconFilter,
  IconFilterOff,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { RowItem, TableConfig } from '@/lib/types';
import { ImageCell } from './ImageCell';
import { formatDate, generateConfigFromData, defaultTableConfig } from '@/lib/tableConfig';

interface DataTableProps {
  data: RowItem[];
  loading?: boolean;
  className?: string;
  config?: TableConfig; // New prop for configuration
}

type SortField = keyof RowItem;
type SortDirection = 'asc' | 'desc';

export default function DataTable({
  data,
  loading = false,
  className,
  config
}: DataTableProps) {
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
  const [criteriaFilter, setCriteriaFilter] = useState<string[]>([]);
  const [classificationFilter, setClassificationFilter] = useState<string[]>([]);

  // Get visible columns from config
  const visibleColumns = useMemo(() => {
    return tableConfig.columns.filter(col => col.visible);
  }, [tableConfig.columns]);

  // Get unique values for filter dropdowns
  const criteriaOptions = useMemo(() => {
    const uniqueCriteria = new Set<string>();
    
    data.forEach(item => {
      if (item.search_criteria) {
        uniqueCriteria.add(item.search_criteria as string);
      }
    });
    
    return Array.from(uniqueCriteria).map(value => ({
      value,
      label: value
    }));
  }, [data]);
  
  const classificationOptions = useMemo(() => {
    const uniqueClassifications = new Set<string>();
    
    data.forEach(item => {
      if (item.classification) {
        uniqueClassifications.add(item.classification as string);
      }
    });
    
    return Array.from(uniqueClassifications).map(value => ({
      value,
      label: value
    }));
  }, [data]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setCriteriaFilter([]);
    setClassificationFilter([]);
  };

  const hasActiveFilters = criteriaFilter.length > 0 || classificationFilter.length > 0;

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />;
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

  // Helper function to render the appropriate cell based on column key
  const renderCell = (item: RowItem, columnKey: string) => {
    if (columnKey === 'image' && item.image) {
      return (
        <ImageCell 
          src={item.image} 
          alt={`Image for ${item.mark_text || item.app_number || 'item'}`}
          width={tableConfig.imageCell.width}
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
    
    if (typeof value === 'string' && value.includes('GMT')) {
      // Try to format as date if it looks like a date string
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return formatDate(date);
        }
      } catch (e) {
        // If date parsing fails, return as is
      }
    }
    
    return String(value);
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
      <div className={cn('p-6 flex flex-col', className)}>
        <Stack gap="md" className="h-full flex flex-col">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={600}>Search Results</Text>
            </div>
            <Text size="sm" c="dimmed">
              {sortedData.length} results
              {hasActiveFilters && ' (filtered)'}
            </Text>
          </Group>

          {/* Filters */}
          {tableConfig.enableFiltering && (
            <Group position="apart" className="pb-2">
              <Group>
                <Select
                  placeholder="Filter by criteria"
                  data={criteriaOptions}
                  value={null}
                  onChange={(value) => {
                    if (value && !criteriaFilter.includes(value)) {
                      setCriteriaFilter([...criteriaFilter, value]);
                    }
                  }}
                  clearable
                  searchable
                  icon={<IconFilter size={14} />}
                  size="sm"
                />
                <Select
                  placeholder="Filter by classification"
                  data={classificationOptions}
                  value={null}
                  onChange={(value) => {
                    if (value && !classificationFilter.includes(value)) {
                      setClassificationFilter([...classificationFilter, value]);
                    }
                  }}
                  clearable
                  searchable
                  icon={<IconFilter size={14} />}
                  size="sm"
                />
              </Group>
              
              {hasActiveFilters && (
                <ActionIcon 
                  variant="subtle" 
                  onClick={clearFilters}
                  title="Clear all filters"
                >
                  <IconFilterOff size={16} />
                </ActionIcon>
              )}
            </Group>
          )}

          {/* Active filters */}
          {hasActiveFilters && (
            <Group className="flex-wrap gap-2 pb-2">
              {criteriaFilter.map(filter => (
                <Badge 
                  key={filter} 
                  color={getCriteriaColor(filter)}
                  variant="light"
                  size="sm"
                  rightSection={
                    <ActionIcon 
                      size="xs" 
                      color="blue" 
                      radius="xl" 
                      variant="transparent"
                      onClick={() => setCriteriaFilter(criteriaFilter.filter(f => f !== filter))}
                    >
                      ×
                    </ActionIcon>
                  }
                >
                  {filter}
                </Badge>
              ))}
              
              {classificationFilter.map(filter => (
                <Badge 
                  key={filter} 
                  color="gray"
                  variant="light"
                  size="sm"
                  rightSection={
                    <ActionIcon 
                      size="xs" 
                      color="blue" 
                      radius="xl" 
                      variant="transparent"
                      onClick={() => setClassificationFilter(classificationFilter.filter(f => f !== filter))}
                    >
                      ×
                    </ActionIcon>
                  }
                >
                  {filter}
                </Badge>
              ))}
            </Group>
          )}

          {/* Table with ScrollArea taking remaining height */}
          <ScrollArea className="flex-1" type="always" offsetScrollbars scrollbarSize={8}>
            <div className="min-w-max">
              <Table
                  highlightOnHover
                  stickyHeader
                  stickyHeaderOffset={0}
                  classNames={{ thead: 'bg-[#6c7d8c] text-white' }}
              >
                <Table.Thead style={{ backgroundColor: '#6c7d8c', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                  <Table.Tr>
                    {visibleColumns.map(column => (
                      <Table.Th 
                        key={String(column.key)}
                        className={column.sortable ? 'cursor-pointer hover:bg-tmh-gray-bg' : ''}
                        onClick={column.sortable ? () => handleSort(column.key as SortField) : undefined}
                        style={{ color: 'white', width: column.width }}
                      >
                        <Group gap="xs">
                          <Text size="sm" fw={500} c="white">{column.header}</Text>
                          {column.sortable && getSortIcon(column.key as SortField)}
                        </Group>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedData.map((item) => (
                    <Table.Tr key={item.id}>
                      {visibleColumns.map(column => (
                        <Table.Td key={`${item.id}-${String(column.key)}`}>
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
              <Box className="text-center py-12">
                <Text size="sm" c="dimmed">
                  {hasActiveFilters ? 'No results match your filters.' : 'No data available.'}
                </Text>
                {hasActiveFilters && (
                    <Button
                        variant="subtle"
                        onClick={clearFilters}
                        size="sm"
                        className="mt-2"
                    >
                      Clear filters to see all results
                    </Button>
                )}
              </Box>
          )}
        </Stack>
      </div>
  );
}