'use client';

import { Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'light' | 'filled' | 'outline';
}

export default function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  className,
  variant = 'light'
}: ErrorMessageProps) {
  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={title}
        color="red"
        variant={variant}
        className="mb-4"
      >
        <div className="space-y-3">
          <p className="text-sm">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={onRetry}
              className="mt-2"
            >
              Try Again
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}