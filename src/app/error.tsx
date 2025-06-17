'use client';

import { useEffect } from 'react';
import { Container } from '@mantine/core';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <>
      <Header />
      <Container size="xl" className="flex-1 py-8 flex items-center justify-center">
        <ErrorMessage
          title="Application Error"
          message={error.message || 'An unexpected error occurred'}
          onRetry={reset}
        />
      </Container>
      <Footer />
    </>
  );
}