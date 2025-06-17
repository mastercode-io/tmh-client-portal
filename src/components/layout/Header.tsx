'use client';

import { Group, Text, ActionIcon, Container, Paper } from '@mantine/core';
import { IconSun, IconMoon, IconBuilding } from '@tabler/icons-react';
import { useTheme } from '../providers/ThemeProvider';

interface HeaderProps {
  clientName?: string;
}

export default function Header({ clientName }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Paper shadow="sm" className="border-b sticky top-0 z-50">
      <Container size="xl" className="py-4">
        <Group justify="space-between" align="center">
          <Group align="center" gap="sm">
            <IconBuilding size={24} className="text-blue-600" />
            <div>
              <Text size="lg" fw={700} className="text-gray-900 dark:text-gray-100">
                Client Portal
              </Text>
              {clientName && (
                <Text size="sm" c="dimmed">
                  {clientName}
                </Text>
              )}
            </div>
          </Group>

          <Group align="center" gap="sm">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </Paper>
  );
}