'use client';

import { TableConfig, defaultTableConfig, generateConfigFromData } from './tableConfig';
import { ClientData } from './types';

/**
 * Loads table configuration based on priority order:
 * 1. Embedded config in data
 * 2. External config file (if defaultConfig=true)
 * 3. Generated config from data structure
 * 
 * @param data The client data that may contain embedded config
 * @returns Promise resolving to the appropriate TableConfig
 */
export async function loadTableConfig(data?: ClientData | null): Promise<TableConfig> {
  try {
    // 1. Check for embedded config in data
    if (data?.table_config) {
      console.log('Using embedded config from data');
      return data.table_config;
    }

    // 2. Check URL parameter for config source preference
    const useDefaultConfig = new URLSearchParams(window.location.search).get('defaultConfig') === 'true';
    
    if (useDefaultConfig) {
      // Use external config file when defaultConfig=true
      console.log('Using external config file (defaultConfig=true)');
      try {
        const response = await fetch('/config/tableConfig.json');
        if (response.ok) {
          return await response.json();
        }
        console.warn('Could not load external config, falling back to data-based config');
      } catch (error) {
        console.error('Error loading external config:', error);
      }
    }
    
    // 3. Generate config from data as fallback
    console.log('Generating config from data structure');
    if (data?.search_data && data.search_data.length > 0) {
      return generateConfigFromData(data.search_data);
    }
    
    // Ultimate fallback to default config
    console.warn('No data available to generate config, using default');
    return defaultTableConfig;
  } catch (error) {
    console.error('Error loading table config:', error);
    return defaultTableConfig;
  }
}
