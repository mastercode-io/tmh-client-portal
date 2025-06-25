'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import { Container, Stack, Paper, Group, Text, Badge } from '@mantine/core';
import { IconBuilding, IconSearch, IconWorld, IconCalendar } from '@tabler/icons-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TabsContainer from '@/components/ui/TabsContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useClientData } from '@/hooks/useClientData';
import { ClientData } from '@/lib/types';

export default function HomePage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id') || searchParams.get('request_id');
  
  const { data, loading, error, refetch } = useClientData(requestId);

  if (!requestId) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 bg-[#f8fafc] overflow-hidden">
          <Container size="xl" className="py-8">
            <ErrorMessage
              title="Missing Request ID"
              message="Please provide a valid request ID in the URL parameter. Example: ?id=sample-client-123"
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
            <LoadingSpinner centered message="Loading client data..." />
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

  // Data validation
  const hasValidTabsData = (data: ClientData): boolean => {
    return 'tabs' in data && Array.isArray(data.tabs);
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

            {/* Search Results - Always use Tabs Container */}
            <Paper p="lg" className="animate-slide-up flex-1 flex flex-col min-h-0">
              {hasValidTabsData(data) ? (
                <TabsContainer 
                  tabs={data.tabs}
                  className="flex-1"
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
