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
import { SearchItem } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import ImageCell from './ImageCell';

interface DataTableProps {
  data: SearchItem[];
  loading?: boolean;
  className?: string;
}

type SortField = keyof SearchItem;
type SortDirection = 'asc' | 'desc';

export default function DataTable({ 
  data, 
  loading = false, 
  className 
}: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [criteriaFilter, setCriteriaFilter] = useState<string[]>([]);
  const [classificationFilter, setClassificationFilter] = useState<string[]>([]);

  const criteriaOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map(item => item.search_criteria)));
    return unique.map(criteria => ({ value: criteria, label: criteria }));
  }, [data]);

  const classificationOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map(item => item.classification)));
    return unique.map(classification => ({ 
      value: classification, 
      label: classification 
    }));
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply criteria filter
    if (criteriaFilter.length > 0) {
      filtered = filtered.filter(item =>
        criteriaFilter.includes(item.search_criteria)
      );
    }

    // Apply classification filter
    if (classificationFilter.length > 0) {
      filtered = filtered.filter(item =>
        classificationFilter.some(filter =>
          item.classification.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection, criteriaFilter, classificationFilter]);

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
            {filteredAndSortedData.length} results
            {hasActiveFilters && ' (filtered)'}
          </Text>
        </Group>

        {/* Table with ScrollArea taking remaining height */}
        <ScrollArea className="flex-1" type="always" offsetScrollbars>
          <Table highlightOnHover withBorder={false} borderless withRowBorders={false} stickyHeader stickyHeaderOffset={0} classNames={{ thead: 'bg-[#6c7d8c] text-white' }}>
            <Table.Thead style={{ backgroundColor: '#6c7d8c', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
              <Table.Tr>
                <Table.Th style={{ color: 'white' }}>Image</Table.Th>
                <Table.Th
                  className="cursor-pointer hover:bg-tmh-gray-bg"
                  onClick={() => handleSort('search_term')}
                  style={{ color: 'white' }}
                >
                  <Group gap="xs">
                    <Text size="sm" fw={500} c="white">Search Term</Text>
                    {getSortIcon('search_term')}
                  </Group>
                </Table.Th>
                <Table.Th
                  className="cursor-pointer hover:bg-tmh-gray-bg"
                  onClick={() => handleSort('search_criteria')}
                  style={{ color: 'white' }}
                >
                  <Group gap="xs">
                    <Text size="sm" fw={500} c="white">Criteria</Text>
                    {getSortIcon('search_criteria')}
                  </Group>
                </Table.Th>
                <Table.Th
                  className="cursor-pointer hover:bg-tmh-gray-bg"
                  onClick={() => handleSort('classification')}
                  style={{ color: 'white' }}
                >
                  <Group gap="xs">
                    <Text size="sm" fw={500} c="white">Classification</Text>
                    {getSortIcon('classification')}
                  </Group>
                </Table.Th>
                <Table.Th style={{ color: 'white' }}>Remarks</Table.Th>
                <Table.Th
                  className="cursor-pointer hover:bg-tmh-gray-bg"
                  onClick={() => handleSort('created_date')}
                  style={{ color: 'white' }}
                >
                  <Group gap="xs">
                    <Text size="sm" fw={500} c="white">Created</Text>
                    {getSortIcon('created_date')}
                  </Group>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAndSortedData.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <ImageCell src={item.image} alt={`Image for ${item.search_term}`} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item.search_term}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getCriteriaColor(item.search_criteria)}
                      variant="light"
                      size="sm"
                    >
                      {item.search_criteria}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={item.classification} withArrow>
                      <Text size="sm" truncate="end" className="max-w-48">
                        {item.classification}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={item.remarks} withArrow>
                      <Text size="sm" truncate="end" className="max-w-64">
                        {item.remarks}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {formatDate(item.created_date)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredAndSortedData.length === 0 && (
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