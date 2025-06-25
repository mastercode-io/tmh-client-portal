'use client';

import { useState } from 'react';
import { Text, Tooltip, Modal, Box, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Eye } from 'lucide-react';

interface ExpandableCellProps {
  content: string;
  maxLength?: number;
  width?: number;
  tooltipEnabled?: boolean;
  modalEnabled?: boolean;
}

export function ExpandableCell({
  content,
  maxLength = 100,
  width,
  tooltipEnabled = true,
  modalEnabled = true
}: ExpandableCellProps) {
  const [opened, { open, close }] = useDisclosure(false);

  // If content is shorter than maxLength, just display it normally with tooltip
  if (!content || content.length <= maxLength) {
    return (
      <Tooltip label={content || ''} withArrow disabled={(content || '').length <= 15}>
        <Text size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {content || ''}
        </Text>
      </Tooltip>
    );
  }

  const truncatedContent = content.substring(0, maxLength) + '...';
  
  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    open();
  };

  return (
    <>
      <div 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0, // Allow shrinking
          gap: '4px'
        }}
      >
        <Tooltip label={content} withArrow>
          <Text 
            size="sm" 
            style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0
            }}
          >
            {truncatedContent}
          </Text>
        </Tooltip>
        
        {modalEnabled && (
          <Tooltip label="View full content" position="top" withArrow>
            <ActionIcon
              variant="light"
              size="xs"
              onClick={openModal}
              color="blue"
              style={{
                flexShrink: 0,
                minWidth: '20px',
                width: '20px',
                height: '20px'
              }}
            >
              <Eye size={12} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>

      {modalEnabled && (
        <Modal 
          opened={opened} 
          onClose={close} 
          title="Full Content" 
          size="lg"
          centered
        >
          <Box p="md" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {content}
            </Text>
          </Box>
        </Modal>
      )}
    </>
  );
}
