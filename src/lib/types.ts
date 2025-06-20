export interface ClientInfo {
  client_name: string;
  search_type: string;
  gs_classes: string;
  sic_code: string;
  business_nature: string;
  countries: string;
}

export interface SearchItem {
  id: string;
  search_term: string;
  search_criteria: 'Identical' | 'Similar' | 'Phonetic' | 'Broad';
  remarks: string;
  image?: string; // base64 encoded image
  classification: string;
}

export interface ClientData {
  client_info: ClientInfo;
  search_data: SearchItem[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TableSortState {
  column: keyof SearchItem | null;
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
  sortedData: SearchItem[];
  filteredData: SearchItem[];
  sortState: TableSortState;
  filterState: TableFilterState;
  handleSort: (column: keyof SearchItem) => void;
  handleFilter: (filters: Partial<TableFilterState>) => void;
  resetFilters: () => void;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}