import { RowItem, TableConfig } from './types';

/**
 * Configuration for a table column
 */
export interface ColumnConfig {
  key: string;
  header: string;
  visible: boolean;
  sortable?: boolean;
  width?: number;
}

/**
 * Configuration for image cell dimensions
 */
export interface ImageCellConfig {
  width: number;
  height: number;
  modalSize?: string;
}

/**
 * Complete table configuration
 */
export interface TableConfig {
  columns: ColumnConfig[];
  imageCell: ImageCellConfig;
  defaultSort?: {
    field?: string;
    direction: 'asc' | 'desc';
  };
  enableFiltering: boolean;
}

/**
 * Default table configuration used as a fallback
 */
export const defaultTableConfig: TableConfig = {
  columns: [
    { key: 'id', header: 'ID', visible: true, sortable: true },
    { key: 'app_number', header: 'Application Number', visible: true, sortable: true },
    { key: 'mark_text', header: 'Mark Text', visible: true, sortable: true },
    { key: 'classes', header: 'Classes', visible: true, sortable: true },
    { key: 'image', header: 'Image', visible: true, sortable: false },
    { key: 'status', header: 'Status', visible: true, sortable: true },
  ],
  imageCell: {
    width: 100,
    height: 50,
    modalSize: 'md'
  },
  defaultSort: {
    direction: 'desc'
  },
  enableFiltering: true
};

/**
 * Generates a table configuration based on the data structure
 * Analyzes the data to determine column types and creates appropriate configuration
 */
export function generateConfigFromData(data: RowItem[]): TableConfig {
  if (!data || data.length === 0) {
    return defaultTableConfig;
  }
  
  const columns: ColumnConfig[] = [];
  const analyzedColumns = new Set<string>();
  const columnTypes: Record<string, string> = {};
  
  // Analyze data to determine column types
  for (const item of data) {
    for (const [key, value] of Object.entries(item)) {
      if (!analyzedColumns.has(key)) {
        // Determine type based on value
        const type = value === undefined ? undefined : 
                     typeof value === 'string' && value.startsWith('data:image') ? 'image' :
                     typeof value;
        
        if (type !== undefined) {
          columnTypes[key] = type;
          analyzedColumns.add(key);
        }
      }
    }
    
    // Stop analysis if we've found types for all keys
    if (Object.keys(data[0] || {}).every(key => analyzedColumns.has(key))) {
      break;
    }
  }
  
  // Create column configs based on analyzed types
  for (const [key, type] of Object.entries(columnTypes)) {
    columns.push({
      key,
      header: formatColumnHeader(key),
      visible: true,
      sortable: type !== 'image',
    });
  }
  
  return {
    columns,
    imageCell: {
      width: 100,
      height: 50,
      modalSize: 'md'
    },
    defaultSort: {
      direction: 'desc'
    },
    enableFiltering: true
  };
}

/**
 * Formats a column key into a readable header
 * Converts snake_case to Title Case
 */
function formatColumnHeader(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generates table configuration from raw JSON data
 * @param rawData The raw JSON data to analyze
 * @returns A generated TableConfig object
 */
export function generateTableConfigFromRawData(rawData: any): TableConfig {
  // Extract the table data from the response
  const tableData = rawData.extracted_data?.auto_detected_table_1 || [];
  
  if (tableData.length === 0) {
    return defaultTableConfig;
  }
  
  // Use the first item to determine available fields
  const sampleItem = tableData[0];
  const columns: ColumnConfig[] = [];
  
  // Add all fields from the raw data
  Object.keys(sampleItem).forEach(key => {
    // Skip very large fields like base64 images
    const value = sampleItem[key];
    if (typeof value === 'object' && value !== null && 'base64' in value) {
      columns.push({ key: 'image', header: 'Image', visible: true, sortable: false });
      return;
    }
    
    // Format the header from the key
    const header = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    columns.push({
      key,
      header,
      visible: true,
      sortable: true
    });
  });
  
  return {
    columns,
    imageCell: {
      width: 100,
      height: 50,
      modalSize: 'md'
    },
    defaultSort: {
      field: 'created_date',
      direction: 'desc'
    },
    enableFiltering: true
  };
}

/**
 * Resolves the table configuration based on priority:
 * 1. Configuration passed with data
 * 2. Configuration loaded from external file
 * 3. Dynamically generated configuration based on data structure
 * 4. Default hardcoded configuration as fallback
 */
export function resolveTableConfig(
  data: RowItem[] | undefined, 
  apiConfig?: TableConfig,
  loadedConfig?: TableConfig
): TableConfig {
  // Priority 1: Configuration from API response
  if (apiConfig) {
    return apiConfig;
  }
  
  // Priority 2: Loaded configuration from file
  if (loadedConfig) {
    return loadedConfig;
  }
  
  // Priority 3: Dynamically generated from data structure
  if (data && data.length > 0) {
    return generateConfigFromData(data);
  }
  
  // Priority 4: Default fallback configuration
  return defaultTableConfig;
}
