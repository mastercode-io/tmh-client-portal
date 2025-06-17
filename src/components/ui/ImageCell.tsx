'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal, Box } from '@mantine/core';
import { IconPhoto, IconPhotoOff } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { isValidBase64Image } from '@/lib/utils';

interface ImageCellProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: number;
}

export default function ImageCell({ 
  src, 
  alt = 'Search result image', 
  className,
  size = 40 
}: ImageCellProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!src || !isValidBase64Image(src) || imageError) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-md border border-gray-200 bg-gray-50',
        className
      )} style={{ width: size, height: size }}>
        <IconPhotoOff size={16} className="text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div 
        className={cn(
          'relative rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
        style={{ width: size, height: size }}
        onClick={() => setModalOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          sizes={`${size}px`}
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <IconPhoto size={16} className="text-white" />
        </div>
      </div>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Image Preview"
        size="md"
        centered
      >
        <Box className="flex justify-center">
          <div className="relative w-64 h-64">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain rounded-md"
              sizes="256px"
            />
          </div>
        </Box>
      </Modal>
    </>
  );
}