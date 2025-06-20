'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal, Box, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { cn } from '@/lib/utils';
import { isValidBase64Image } from '@/lib/utils';
import { IconPhoto } from '@tabler/icons-react';

// Empty cell component
const EmptyCell = ({ width, height }) => {
  return <div style={{ width: `${width}px`, height: `${height}px` }} />;
};

// Placeholder component
const Placeholder = ({ width, height }) => {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
      }}
    >
      <IconPhoto size={20} color="#999" />
    </div>
  );
};

interface ImageCellProps {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  modalSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function ImageCell({ 
  src, 
  alt = 'Image', 
  className, 
  width = 100, 
  height = 50,
  modalSize = 'md'
}: ImageCellProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [imageError, setImageError] = useState(false);

  // If no image source is provided, show an empty cell
  if (!src) {
    return <EmptyCell width={width} height={height} />;
  }

  // If image validation fails or there was an error loading the image, show placeholder
  if (!isValidBase64Image(src) || imageError) {
    return <Placeholder width={width} height={height} />;
  }

  // Determine if this is a base64 image or a URL
  const isBase64 = src.startsWith('data:');

  return (
    <>
      <div 
        className={cn(
          'relative rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={open}
      >
        {isBase64 ? (
          // Use regular img tag for base64 data
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error('Image loading error (img tag):', e);
              setImageError(true);
            }}
          />
        ) : (
          // Use Next.js Image for URLs
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            onError={(e) => {
              console.error('Image loading error (Next.js):', e);
              setImageError(true);
            }}
            sizes={`${Math.max(width, height)}px`}
          />
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <IconPhoto size={16} className="text-white" />
        </div>
      </div>

      <Modal
        opened={opened}
        onClose={close}
        title="Image Preview"
        size={modalSize}
        centered
      >
        <Box className="flex justify-center">
          <div className="relative w-full" style={{ height: '400px' }}>
            {isBase64 ? (
              // Use regular img tag for base64 data in modal
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain rounded-md"
                onError={() => setImageError(true)}
              />
            ) : (
              // Use Next.js Image for URLs in modal
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain rounded-md"
                sizes="100vw"
              />
            )}
          </div>
        </Box>
      </Modal>
    </>
  );
}