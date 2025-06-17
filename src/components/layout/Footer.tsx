'use client';

import { Container, Text } from '@mantine/core';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-tmh-dark-header border-t border-gray-700 mt-auto">
      <Container size="xl" className="py-4">
        <Text 
          size="xs" 
          className="text-white"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400
          }}
        >
          © {currentYear} The Trademark Helpline. All rights reserved.
        </Text>
      </Container>
    </div>
  );
}