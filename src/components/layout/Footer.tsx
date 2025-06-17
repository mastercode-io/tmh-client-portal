'use client';

import { Container, Group, Text, Divider, Stack } from '@mantine/core';
import { IconBuilding, IconClock, IconShield } from '@tabler/icons-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-t mt-auto">
      <Container size="xl" className="py-8">
        <Stack gap="md">
          <Group gap="xl" grow align="flex-start">
            <div>
              <Group align="center" gap="xs" className="mb-3">
                <IconBuilding size={16} className="text-blue-600" />
                <Text size="sm" fw={600}>
                  TMH Client Portal
                </Text>
              </Group>
              <Text size="xs" c="dimmed" className="mb-2">
                Professional trademark search and analysis platform
              </Text>
              <Text size="xs" c="dimmed">
                Secure • Reliable • Comprehensive
              </Text>
            </div>

            <div>
              <Group align="center" gap="xs" className="mb-3">
                <IconClock size={16} className="text-blue-600" />
                <Text size="sm" fw={600}>
                  Service Information
                </Text>
              </Group>
              <Text size="xs" c="dimmed" className="mb-1">
                Data updated in real-time
              </Text>
              <Text size="xs" c="dimmed" className="mb-1">
                Advanced search algorithms
              </Text>
              <Text size="xs" c="dimmed">
                Comprehensive analysis reports
              </Text>
            </div>

            <div>
              <Group align="center" gap="xs" className="mb-3">
                <IconShield size={16} className="text-blue-600" />
                <Text size="sm" fw={600}>
                  Security & Privacy
                </Text>
              </Group>
              <Text size="xs" c="dimmed" className="mb-1">
                End-to-end encryption
              </Text>
              <Text size="xs" c="dimmed" className="mb-1">
                GDPR compliant
              </Text>
              <Text size="xs" c="dimmed">
                Secure data transmission
              </Text>
            </div>
          </Group>

          <Divider />

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              © {currentYear} TMH Client Portal. All rights reserved.
            </Text>
            <Group gap="md">
              <Text size="xs" c="dimmed">
                Version 1.0.0
              </Text>
              <Text size="xs" c="dimmed">
                Next.js 14 • React 18
              </Text>
            </Group>
          </Group>
        </Stack>
      </Container>
    </div>
  );
}