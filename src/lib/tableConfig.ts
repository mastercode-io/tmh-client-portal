import { SearchItem } from './types';

/**
 * Configuration for a table column
 */
export interface ColumnConfig {
  key: keyof SearchItem | 'image';  // Special case for image column
  header: string;
  visible: boolean;
  width?: string;
  sortable?: boolean;
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
    field?: keyof SearchItem;
    direction: 'asc' | 'desc';
  };
  enableFiltering: boolean;
}

/**
 * Default table configuration
 */
export const defaultTableConfig: TableConfig = {
  columns: [
    { key: 'image', header: 'Image', visible: true },
    { key: 'search_term', header: 'Search Term', visible: true, sortable: true },
    { key: 'search_criteria', header: 'Criteria', visible: true, sortable: true },
    { key: 'classification', header: 'Classification', visible: true, sortable: true },
    { key: 'remarks', header: 'Remarks', visible: true },
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
 * Dynamically generates table configuration based on the structure of the first data item
 * @param data The array of data items to analyze
 * @returns A generated TableConfig object
 */
export function generateConfigFromData(data: SearchItem[]): TableConfig {
  if (!data || data.length === 0) {
    return defaultTableConfig;
  }

  // Use the first item to determine available fields
  const sampleItem = data[0];
  const columns: ColumnConfig[] = [];
  
  // Special case for image field if it exists
  if ('image' in sampleItem && sampleItem.image) {
    columns.push({ key: 'image', header: 'Image', visible: true });
  }
  
  // Add all other fields from the data
  Object.keys(sampleItem).forEach(key => {
    if (key !== 'image') { // Skip image as we've already handled it
      const fieldKey = key as keyof SearchItem;
      
      // Determine if field should be sortable based on its type
      const value = sampleItem[fieldKey];
      const sortable = typeof value === 'string' || typeof value === 'number' || value instanceof Date;
      
      // Format the header from the key (e.g., 'search_term' -> 'Search Term')
      const header = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      columns.push({
        key: fieldKey,
        header,
        visible: true,
        sortable
      });
    }
  });
  
  return {
    columns,
    imageCell: {
      width: 100,
      height: 50,
      modalSize: 'md'
    },
    defaultSort: {
      field: 'created_date' in sampleItem ? 'created_date' : (columns[0]?.key as keyof SearchItem),
      direction: 'desc'
    },
    enableFiltering: true
  };
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
      columns.push({ key: 'image', header: 'Image', visible: true });
      return;
    }
    
    // Format the header from the key
    const header = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    columns.push({
      key: key as any,
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
      field: 'created_date' as keyof SearchItem,
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
  data: SearchItem[] | undefined, 
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
