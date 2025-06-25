import { ClientData, RowItem, MultiTabApiResponse, ProcessedTabData } from './types';
import multiTabData from '../data/multi-tab.json';

/**
 * Transforms the multi-tab JSON data into the format expected by the application
 */
export function transformMultiTabData(): ClientData {
  const data = multiTabData as MultiTabApiResponse;
  
  console.log('Multi-tab data adapter - Processing tabs:', data.tabs?.length || 0);
  
  // Process each tab using the same logic as single table transformation
  const processedTabs: ProcessedTabData[] = data.tabs.map((tab) => {
    let tabData: RowItem[] = [];
    let hasData = false;
    
    // Check if tab has table data
    const extractedData = tab.extracted_data;
    
    // Look for table data (auto_detected_table_* keys) - same as single table logic
    const tableKey = Object.keys(extractedData).find(key => 
      key.startsWith('auto_detected_table_') && Array.isArray(extractedData[key])
    );
    
    if (tableKey && Array.isArray(extractedData[tableKey])) {
      const tableArray = extractedData[tableKey] as any[];
      
      // Use the SAME transformation logic as transformResponseData()
      tabData = tableArray.map((item: any, index) => {
        // Handle image field separately to avoid type errors (same as single table)
        let imageData: string | undefined = undefined;
        
        // Safely extract image data if it exists
        if (item && item.image !== undefined) {
          const imgData = item.image;
          if (typeof imgData === 'object' && imgData !== null && 'base64' in imgData) {
            imageData = imgData.base64;
          } else if (typeof imgData === 'string') {
            imageData = imgData;
          }
        }
        
        // Create a new object without the image property
        const { image, ...rest } = item;
        
        // Add an id if not present and include the properly formatted image
        const rowItem: RowItem = { 
          ...rest, 
          id: item.app_number || item.company_number || item.domain || item.profile_url || `row-${index + 1}`,
          ...(imageData !== undefined ? { image: imageData } : {})
        };
        
        return rowItem;
      });
      
      hasData = tableArray.length > 0;
    } else {
      // For tabs without table data (like Google with key-value pairs), keep them empty
      // Don't try to convert key-value pairs to table format
      hasData = false;
    }
    
    return {
      name: tab.sheet_name,
      data: tabData,
      hasData,
      metadata: tab.metadata
    };
  });
  
  console.log('Multi-tab data adapter - Processed tabs:', 
    processedTabs.map(tab => `${tab.name}: ${tab.data.length} items (hasData: ${tab.hasData})`).join(', ')
  );
  
  // Create client info using the same extraction logic as single table
  const allTabData = processedTabs.flatMap(tab => tab.data);
  const clientInfo = {
    client_name: "TMH Client",
    search_type: "Multi-Source Search", 
    gs_classes: extractClassesFromMultiTabData(allTabData),
    sic_code: extractSicCodesFromMultiTabData(processedTabs),
    business_nature: "Trademark & Business Intelligence",
    countries: extractCountriesFromMultiTabData(allTabData),
  };
  
  return {
    client_info: clientInfo,
    tabs: processedTabs,
  };
}

/**
 * Extract unique classes from all tab data (same logic as single table)
 */
function extractClassesFromMultiTabData(allData: RowItem[]): string {
  const allClasses = allData
    .map((item: any) => item.classes || '')
    .filter(Boolean)
    .flatMap((classes: string) => classes.split(',').map((c: string) => c.trim()))
    .filter(Boolean);
  
  // Get unique classes and sort numerically (same as single table)
  const uniqueClasses = [...new Set(allClasses)].sort((a: string, b: string) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });
  
  return uniqueClasses.join(', ');
}

/**
 * Extract unique SIC codes from company data (improved logic)
 */
function extractSicCodesFromMultiTabData(tabs: ProcessedTabData[]): string {
  const companiesTab = tabs.find(tab => tab.name.toLowerCase().includes('companies') || tab.name.toLowerCase().includes('company'));
  if (!companiesTab || !companiesTab.hasData) return "Educational Support Services";
  
  const sicCodes = companiesTab.data
    .map((item: any) => item.sic)
    .filter(Boolean)
    .map(sic => typeof sic === 'string' ? sic.split(' ')[0] : String(sic))
    .filter(Boolean);
  
  const uniqueSics = [...new Set(sicCodes)].slice(0, 3);
  return uniqueSics.length > 0 ? uniqueSics.join(', ') : "Educational Support Services";
}

/**
 * Extract countries from various data sources (same logic as single table)
 */
function extractCountriesFromMultiTabData(allData: RowItem[]): string {
  const allCountries: string[] = allData
    .map((item: any) => {
      if (item.office) {
        const match = item.office.match(/\(([^)]+)\)/);
        return match ? match[1] : item.office;
      }
      return item.owner_location || item.country || '';
    })
    .filter((country: string) => Boolean(country));
  
  // Get unique countries (same as single table)
  const uniqueCountries: string[] = [...new Set(allCountries)];
  
  return uniqueCountries.slice(0, 5).join(', ') || "UK";
}
