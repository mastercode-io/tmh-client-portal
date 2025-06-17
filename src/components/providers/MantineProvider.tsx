'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  colors: {
    blue: [
      '#eff6ff',
      '#dbeafe', 
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a'
    ],
    gray: [
      '#f9fafb',
      '#f3f4f6',
      '#e5e7eb',
      '#d1d5db',
      '#9ca3af',
      '#6b7280',
      '#4b5563',
      '#374151',
      '#1f2937',
      '#111827'
    ],
  },
  components: {
    Button: {
      defaultProps: {
        fw: 500,
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
      },
    },
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
      },
    },
  },
});

interface MantineProviderWrapperProps {
  children: React.ReactNode;
}

export default function MantineProviderWrapper({ children }: MantineProviderWrapperProps) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}