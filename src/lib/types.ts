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

export interface ClientData {
  client_info: ClientInfo;
  search_data: RowItem[];
  table_config?: TableConfig; // Optional embedded configuration
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