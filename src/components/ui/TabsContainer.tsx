'use client';

import { useState } from 'react';
import { Tabs, Text, Box, Badge } from '@mantine/core';
import { IconTable, IconFileX } from '@tabler/icons-react';
import DataTable from './DataTable';
import { ProcessedTabData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TabsContainerProps {
  tabs: ProcessedTabData[];
  className?: string;
}

export default function TabsContainer({ tabs, className }: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.name || '');

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <Tabs
        value={activeTab}
        onChange={(value) => value && setActiveTab(value)}
        className="flex flex-col h-full"
      >
        {/* Tab Headers */}
        <Tabs.List className="mb-4 flex-shrink-0">
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.name}
              value={tab.name}
              leftSection={<IconTable size={16} />}
              rightSection={
                <Badge
                  size="xs"
                  variant={tab.hasData ? "filled" : "outline"}
                  color={tab.hasData ? "blue" : "gray"}
                >
                  {tab.data.length}
                </Badge>
              }
            >
              {tab.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {/* Tab Content - Each DataTable generates its own config */}
        <div className="flex-1 min-h-0">
          {tabs.map((tab) => (
            <Tabs.Panel
              key={tab.name}
              value={tab.name}
              className="h-full"
            >
              {tab.hasData ? (
                <DataTable
                  data={tab.data}
                  className="h-full"
                />
              ) : (
                <EmptyTabContent tabName={tab.name} />
              )}
            </Tabs.Panel>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

// Empty state component for tabs with no data
function EmptyTabContent({ tabName }: { tabName: string }) {
  return (
    <Box className="flex flex-col items-center justify-center h-full py-16">
      <IconFileX size={64} className="text-gray-400 mb-4" />
      <Text size="lg" fw={500} className="text-gray-600 mb-2">
        No Data Available
      </Text>
      <Text size="sm" className="text-gray-500 text-center max-w-md">
        The {tabName} search did not return any results. This could be because no matching records were found or the data source is currently unavailable.
      </Text>
    </Box>
  );
} 