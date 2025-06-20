'use client';

import { useState } from 'react';
import { Text, Tooltip, Modal, Box, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMaximize, IconMinimize } from '@tabler/icons-react';

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
  const [expanded, setExpanded] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  // If content is shorter than maxLength, just display it
  if (!content || content.length <= maxLength) {
    return <Text size="sm">{content || ''}</Text>;
  }

  const truncatedContent = content.substring(0, maxLength) + '...';
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    open();
  };

  return (
    <>
      <div 
        style={{ 
          width: width ? `${width}px` : 'auto',
          maxWidth: width ? `${width}px` : '100%',
          position: 'relative'
        }}
      >
        {tooltipEnabled ? (
          <Tooltip 
            label={expanded ? 'Click to collapse' : 'Click to expand'} 
            position="top" 
            withArrow
          >
            <div>
              <Text 
                size="sm" 
                style={{ 
                  whiteSpace: expanded ? 'pre-wrap' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer',
                  wordBreak: 'break-word'
                }}
                onClick={toggleExpand}
              >
                {expanded ? content : truncatedContent}
              </Text>
            </div>
          </Tooltip>
        ) : (
          <Text 
            size="sm" 
            style={{ 
              whiteSpace: expanded ? 'pre-wrap' : 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
              wordBreak: 'break-word'
            }}
            onClick={toggleExpand}
          >
            {expanded ? content : truncatedContent}
          </Text>
        )}
        
        <div className="flex gap-1 mt-1">
          <Button 
            variant="subtle" 
            size="xs" 
            onClick={toggleExpand}
            leftSection={expanded ? <IconMinimize size={12} /> : <IconMaximize size={12} />}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
          
          {modalEnabled && (
            <Button 
              variant="subtle" 
              size="xs" 
              onClick={openModal}
              leftSection={<IconMaximize size={12} />}
            >
              Full View
            </Button>
          )}
        </div>
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
