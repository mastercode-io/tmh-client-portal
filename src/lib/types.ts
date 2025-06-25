export interface ClientInfo {
  client_name: string;
  search_type: string;
  gs_classes: string;
  sic_code: string;
  business_nature: string;
  countries: string;
}

export interface RowItem {
  [key: string]: any; // Allow any property to support dynamic data structure
  id?: string;
  image?: string; // base64 encoded image
}

// New multi-tab interfaces
export interface TabMetadata {
  data_types_detected: string[];
  extracted_rows: number;
  extraction_method: string;
  total_columns: number;
  total_rows: number;
}

export interface TabData {
  extracted_data: {
    [key: string]: any; // Can contain key-value pairs or table arrays
  };
  metadata: TabMetadata;
  sheet_name: string;
  success: boolean;
}

export interface MultiTabApiResponse {
  success: boolean;
  summary: {
    processing_time_ms: number;
    sheets_not_found: number;
    sheets_processed: number;
    sheets_with_errors: number;
    timestamp: string;
    total_sheets_requested: number;
  };
  tabs: TabData[];
}

export interface ProcessedTabData {
  name: string;
  data: RowItem[];
  hasData: boolean;
  metadata: TabMetadata;
}

export interface ClientData {
  client_info: ClientInfo;
  search_data: RowItem[];
  table_config?: TableConfig; // Optional embedded configuration
}

// New multi-tab client data interface
export interface MultiTabClientData {
  client_info: ClientInfo;
  tabs: ProcessedTabData[];
  table_config?: TableConfig;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TableSortState {
  column: keyof RowItem | null;
  direction: 'asc' | 'desc';
}

export interface TableFilterState {
  search: string;
  criteria: string[];
  classification: string[];
}

export interface UseClientDataReturn {
  data: ClientData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Extended return type for multi-tab support
export interface UseMultiTabClientDataReturn {
  data: ClientData | MultiTabClientData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isMultiTab: boolean;
}

export interface UseTableReturn {
  sortedData: RowItem[];
  filteredData: RowItem[];
  sortState: TableSortState;
  filterState: TableFilterState;
  handleSort: (column: keyof RowItem) => void;
  handleFilter: (filters: Partial<TableFilterState>) => void;
  resetFilters: () => void;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface TableConfig {
  columns: {
    key: string;
    header: string;
    visible: boolean;
    sortable?: boolean;
    width?: number;
    maxLength?: number;
    expandable?: boolean;
  }[];
  imageCell: {
    width: number;
    height: number;
    modalSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  };
  defaultSort?: {
    field?: string;
    direction: 'asc' | 'desc';
  };
  enableFiltering: boolean;
  preserveColumnOrder?: boolean;
}