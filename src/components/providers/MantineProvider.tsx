'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  colors: {
    primary: [
      '#eff6ff',
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a',
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