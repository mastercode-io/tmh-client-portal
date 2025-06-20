'use client';

import { TableConfig, defaultTableConfig } from './tableConfig';

/**
 * Loads table configuration from an external JSON file
 * Falls back to default configuration if loading fails
 */
export async function loadTableConfig(): Promise<TableConfig> {
  try {
    // Path to the configuration file - can be adjusted as needed
    const response = await fetch('/config/tableConfig.json');
    
    if (!response.ok) {
      console.warn('Could not load table config, using default');
      return defaultTableConfig;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading table config:', error);
    return defaultTableConfig;
  }
}
