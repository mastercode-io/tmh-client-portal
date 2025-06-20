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
  maxLength?: number; // Maximum length before truncation
  expandable?: boolean; // Whether long content can be expanded
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
  preserveColumnOrder?: boolean; // New option to preserve column order from data
}

/**
 * Default table configuration used as a fallback
 */
export const defaultTableConfig: TableConfig = {
  columns: [
    { key: 'id', header: 'ID', visible: true, sortable: true, width: 100 },
    { key: 'app_number', header: 'Application Number', visible: true, sortable: true, width: 150 },
    { key: 'mark_text', header: 'Mark Text', visible: true, sortable: true, width: 200, maxLength: 50, expandable: true },
    { key: 'classes', header: 'Classes', visible: true, sortable: true, width: 100 },
    { key: 'image', header: 'Image', visible: true, sortable: false, width: 100 },
    { key: 'status', header: 'Status', visible: true, sortable: true, width: 120 },
    { key: 'primary_goods_services', header: 'Goods & Services', visible: true, sortable: true, width: 250, maxLength: 100, expandable: true },
  ],
  imageCell: {
    width: 100,
    height: 50,
    modalSize: 'md'
  },
  defaultSort: {
    direction: 'desc'
  },
  enableFiltering: true,
  preserveColumnOrder: true // New option to preserve column order from data
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
  
  // Get the first item to determine key order
  const firstItem = data[0];
  const orderedKeys = Object.keys(firstItem);
  
  // Analyze data to determine column types
  for (const item of data) {
    for (const key of orderedKeys) {
      if (!analyzedColumns.has(key)) {
        const value = item[key];
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
    if (orderedKeys.every(key => analyzedColumns.has(key))) {
      break;
    }
  }
  
  // Create column configs based on analyzed types and preserve order
  for (const key of orderedKeys) {
    if (columnTypes[key]) {
      const type = columnTypes[key];
      const isLongText = type === 'string' && 
                        data.some(item => item[key] && typeof item[key] === 'string' && (item[key] as string).length > 100);
      
      columns.push({
        key,
        header: formatColumnHeader(key),
        visible: true,
        sortable: type !== 'image',
        width: determineColumnWidth(key, type),
        maxLength: isLongText ? 100 : undefined,
        expandable: isLongText
      });
    }
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
    enableFiltering: true,
    preserveColumnOrder: true
  };
}

/**
 * Determines an appropriate column width based on the key name and data type
 */
function determineColumnWidth(key: string, type: string): number {
  // Set column widths based on content type
  if (type === 'image') return 100;
  
  // Set widths based on common field names
  switch (key) {
    case 'id': return 80;
    case 'app_number': return 150;
    case 'mark_text': return 200;
    case 'classes': return 100;
    case 'status': return 120;
    case 'owner_name': return 200;
    case 'primary_goods_services': return 250;
    default:
      // Set width based on key length for other fields
      return Math.max(100, Math.min(200, key.length * 10));
  }
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
      columns.push({ key: 'image', header: 'Image', visible: true, sortable: false, width: 100 });
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
      sortable: true,
      width: determineColumnWidth(key, typeof value)
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
    enableFiltering: true,
    preserveColumnOrder: true
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
