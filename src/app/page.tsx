'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Container, Stack, Paper, Group, Text, Badge, Divider } from '@mantine/core';
import { IconBuilding, IconSearch, IconWorld, IconCalendar } from '@tabler/icons-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DataTable from '@/components/ui/DataTable';
import TabsContainer from '@/components/ui/TabsContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useClientData } from '@/hooks/useClientData';
import { TableConfig, ClientData, MultiTabClientData } from '@/lib/types';
import { loadTableConfig } from '@/lib/configLoader';

export default function HomePage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id') || searchParams.get('request_id');
  const multiTabMode = searchParams.get('tabs') === 'true';
  
  const { data, loading, error, refetch, isMultiTab } = useClientData(requestId, multiTabMode);
  const [tableConfig, setTableConfig] = useState<TableConfig | undefined>(undefined);
  
  // Load table configuration when component mounts or data changes
  useEffect(() => {
    async function fetchConfig() {
      try {
        // Only generate config for single-tab mode
        // Multi-tab mode: each DataTable will generate its own config from its own data
        if (!isMultiTab && data && 'search_data' in data) {
          const config = await loadTableConfig(data as ClientData);
          setTableConfig(config);
        }
      } catch (error) {
        console.error('Failed to load table configuration:', error);
      }
    }
    
    if (data) {
      fetchConfig();
    }
  }, [data, isMultiTab]);

  if (!requestId) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 bg-[#f8fafc] overflow-hidden">
          <Container size="xl" className="py-8">
            <ErrorMessage
              title="Missing Request ID"
              message="Please provide a valid request ID in the URL parameter. Example: ?id=sample-client-123&tabs=true for multi-tab view"
            />
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 bg-[#f8fafc] overflow-hidden">
          <Container size="xl" className="py-8">
            <LoadingSpinner centered message={`Loading ${isMultiTab ? 'multi-tab ' : ''}client data...`} />
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 bg-[#f8fafc] overflow-hidden">
          <Container size="xl" className="py-8">
            <ErrorMessage
              title="Failed to Load Data"
              message={error}
              onRetry={refetch}
            />
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 bg-[#f8fafc] overflow-hidden">
          <Container size="xl" className="py-8">
            <ErrorMessage
              title="No Data Found"
              message="No client data was found for the provided request ID."
              onRetry={refetch}
            />
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  // Type guards
  const isSingleTabData = (data: ClientData | MultiTabClientData): data is ClientData => {
    return 'search_data' in data;
  };

  const isMultiTabData = (data: ClientData | MultiTabClientData): data is MultiTabClientData => {
    return 'tabs' in data;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header clientName={data.client_info.client_name} />
      
      <div className="flex-1 bg-[#f8fafc] overflow-hidden">
        <Container size="xl" className="py-4 h-full flex flex-col">
          <Stack gap="md" className="h-full flex flex-col">
            {/* Client Information Card */}
            <Paper p="lg" className="animate-fade-in" bg="#6c7d8c" c="white">
              <Group align="center" gap="sm" className="mb-4">
                <IconBuilding size={20} className="text-white" />
                <Text size="lg" fw={600}>
                  Client Information
                </Text>
                {isMultiTab && (
                  <Badge size="sm" variant="light" color="yellow">
                    Multi-Tab View
                  </Badge>
                )}
              </Group>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Group align="center" gap="xs" className="mb-2">
                    <IconBuilding size={16} className="text-gray-300" />
                    <Text size="sm" fw={500} c="gray.3">
                      Company Name
                    </Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    {data.client_info.client_name}
                  </Text>
                </div>
                
                <div>
                  <Group align="center" gap="xs" className="mb-2">
                    <IconSearch size={16} className="text-gray-300" />
                    <Text size="sm" fw={500} c="gray.3">
                      Search Type
                    </Text>
                  </Group>
                  <Badge variant="light" size="sm">
                    {data.client_info.search_type}
                  </Badge>
                </div>
                
                <div>
                  <Group align="center" gap="xs" className="mb-2">
                    <IconCalendar size={16} className="text-gray-300" />
                    <Text size="sm" fw={500} c="gray.3">
                      Classifications
                    </Text>
                  </Group>
                  <Text size="sm">
                    {data.client_info.gs_classes}
                  </Text>
                </div>
                
                <div>
                  <Text size="sm" fw={500} c="gray.3" className="mb-2">
                    SIC Code
                  </Text>
                  <Text size="sm">
                    {data.client_info.sic_code}
                  </Text>
                </div>
                
                <div>
                  <Text size="sm" fw={500} c="gray.3" className="mb-2">
                    Business Nature
                  </Text>
                  <Text size="sm">
                    {data.client_info.business_nature}
                  </Text>
                </div>
                
                <div>
                  <Group align="center" gap="xs" className="mb-2">
                    <IconWorld size={16} className="text-gray-300" />
                    <Text size="sm" fw={500} c="gray.3">
                      Countries
                    </Text>
                  </Group>
                  <Text size="sm">
                    {data.client_info.countries}
                  </Text>
                </div>
              </div>
            </Paper>

            {/* Search Results - Either Tabs or Single Table */}
            <Paper p="lg" className="animate-slide-up flex-1 overflow-hidden flex flex-col">
              {isMultiTab && isMultiTabData(data) ? (
                <TabsContainer 
                  tabs={data.tabs}
                  className="flex-1"
                />
              ) : isSingleTabData(data) ? (
                <DataTable 
                  data={data.search_data} 
                  className="flex-1 overflow-hidden"
                  config={tableConfig}
                />
              ) : null}
            </Paper>
          </Stack>
        </Container>
      </div>
      
      <Footer />
    </div>
  );
}
