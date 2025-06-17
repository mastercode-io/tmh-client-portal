'use client';

import { Loader } from '@mantine/core';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  centered?: boolean;
  message?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className, 
  centered = false,
  message = 'Loading...'
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Loader size={size} color="blue" />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px] w-full">
        {content}
      </div>
    );
  }

  return content;
}