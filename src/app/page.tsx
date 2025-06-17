'use client';

import { useSearchParams } from 'next/navigation';
import { Container, Stack, Paper, Group, Text, Badge, Divider } from '@mantine/core';
import { IconBuilding, IconSearch, IconWorld, IconCalendar } from '@tabler/icons-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DataTable from '@/components/ui/DataTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useClientData } from '@/hooks/useClientData';

export default function HomePage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id') || searchParams.get('request_id');
  
  const { data, loading, error, refetch } = useClientData(requestId);

  if (!requestId) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <Container size="xl" className="flex-1 py-8 overflow-auto">
          <ErrorMessage
            title="Missing Request ID"
            message="Please provide a valid request ID in the URL parameter. Example: ?id=sample-client-123"
          />
        </Container>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <Container size="xl" className="flex-1 py-8 overflow-auto">
          <LoadingSpinner centered message="Loading client data..." />
        </Container>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <Container size="xl" className="flex-1 py-8 overflow-auto">
          <ErrorMessage
            title="Failed to Load Data"
            message={error}
            onRetry={refetch}
          />
        </Container>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <Container size="xl" className="flex-1 py-8 overflow-auto">
          <ErrorMessage
            title="No Data Found"
            message="No client data was found for the provided request ID."
            onRetry={refetch}
          />
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header clientName={data.client_info.client_name} />
      
      <Container size="xl" className="flex-1 py-4 overflow-hidden flex flex-col">
        <Stack gap="md" className="h-full flex flex-col">
          {/* Client Information Card */}
          <Paper p="lg" className="animate-fade-in">
            <Group align="center" gap="sm" className="mb-4">
              <IconBuilding size={20} className="text-blue-600" />
              <Text size="lg" fw={600}>
                Client Information
              </Text>
            </Group>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Group align="center" gap="xs" className="mb-2">
                  <IconBuilding size={16} className="text-gray-500" />
                  <Text size="sm" fw={500} c="dimmed">
                    Company Name
                  </Text>
                </Group>
                <Text size="sm" fw={600}>
                  {data.client_info.client_name}
                </Text>
              </div>
              
              <div>
                <Group align="center" gap="xs" className="mb-2">
                  <IconSearch size={16} className="text-gray-500" />
                  <Text size="sm" fw={500} c="dimmed">
                    Search Type
                  </Text>
                </Group>
                <Badge variant="light" size="sm">
                  {data.client_info.search_type}
                </Badge>
              </div>
              
              <div>
                <Group align="center" gap="xs" className="mb-2">
                  <IconCalendar size={16} className="text-gray-500" />
                  <Text size="sm" fw={500} c="dimmed">
                    Classifications
                  </Text>
                </Group>
                <Text size="sm">
                  {data.client_info.gs_classes}
                </Text>
              </div>
              
              <div>
                <Text size="sm" fw={500} c="dimmed" className="mb-2">
                  SIC Code
                </Text>
                <Text size="sm">
                  {data.client_info.sic_code}
                </Text>
              </div>
              
              <div>
                <Text size="sm" fw={500} c="dimmed" className="mb-2">
                  Business Nature
                </Text>
                <Text size="sm">
                  {data.client_info.business_nature}
                </Text>
              </div>
              
              <div>
                <Group align="center" gap="xs" className="mb-2">
                  <IconWorld size={16} className="text-gray-500" />
                  <Text size="sm" fw={500} c="dimmed">
                    Countries
                  </Text>
                </Group>
                <Text size="sm">
                  {data.client_info.countries}
                </Text>
              </div>
            </div>
          </Paper>

          <Divider />

          {/* Search Results Table */}
          <div className="animate-slide-up flex-1 overflow-hidden flex flex-col">
            <DataTable 
              data={data.search_data} 
              onRefresh={refetch}
              className="flex-1 overflow-hidden flex flex-col"
            />
          </div>
        </Stack>
      </Container>
      
      <Footer />
    </div>
  );
}