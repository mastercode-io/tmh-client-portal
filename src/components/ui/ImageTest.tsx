'use client';

import { useState } from 'react';
import { Box, Text, Button, Group, Stack, Paper, Code } from '@mantine/core';
import { generateSimpleBase64Image } from '@/lib/mockData';

// A known working base64 image (1x1 pixel transparent PNG)
const KNOWN_GOOD_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function ImageTest() {
  const [testImages, setTestImages] = useState<{color: string, image: string}[]>([]);
  const [showRawData, setShowRawData] = useState(false);

  const generateTestImages = () => {
    const colors = ['red', 'blue', 'green', 'orange', 'purple'];
    const images = colors.map(color => ({
      color,
      image: generateSimpleBase64Image(color)
    }));
    setTestImages(images);
  };

  return (
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="lg" fw={600}>Image Rendering Test</Text>
          <Text size="sm">This component tests if base64 images from mockData.ts can be rendered properly.</Text>

          <Group>
            <Button onClick={generateTestImages} size="sm">Generate Test Images</Button>
            <Button onClick={() => setShowRawData(!showRawData)} size="sm" variant="outline">
              {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
            </Button>
          </Group>

          {/* Known good base64 test */}
          <Box>
            <Text size="sm" fw={500} mb="xs">Control Test (Known Good Base64):</Text>
            <div style={{ marginBottom: '10px' }}>
              <img
                  src={KNOWN_GOOD_BASE64}
                  alt="Control test"
                  style={{ width: '40px', height: '40px', border: '1px solid #ccc', background: '#f0f0f0' }}
              />
              <Text size="xs" mt={5}>This should display a transparent 1x1 pixel</Text>
            </div>
          </Box>

          {testImages.length > 0 && (
              <Box>
                <Text size="sm" fw={500} mb="xs">Test Results:</Text>
                <Group>
                  {testImages.map((item, index) => (
                      <Stack key={index} align="center" gap="xs">
                        <Text size="xs">{item.color}</Text>

                        {/* Regular img tag */}
                        <Box>
                          <Text size="xs" mb={5}>Regular img:</Text>
                          <div style={{ border: '1px solid #ccc', background: '#f0f0f0' }}>
                            <img
                                src={item.image}
                                alt={`${item.color} test`}
                                style={{ width: '40px', height: '40px' }}
                            />
                          </div>
                        </Box>

                        {/* Base64 length */}
                        <Text size="xs">Length: {item.image.length}</Text>

                        {/* Raw data display */}
                        {showRawData && (
                            <Box mt={10} style={{ maxWidth: '200px' }}>
                              <Text size="xs" mb={5}>Raw Base64 Data:</Text>
                              <Code block style={{ fontSize: '8px', maxHeight: '100px', overflow: 'auto' }}>
                                {item.image}
                              </Code>
                            </Box>
                        )}
                      </Stack>
                  ))}
                </Group>
              </Box>
          )}
        </Stack>
      </Paper>
  );
}