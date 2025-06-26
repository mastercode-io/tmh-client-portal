import { ClientData, RowItem, ProcessedTabData } from './types';

/**
 * Transforms Zoho CRM API response into the format expected by the frontend
 */
export function transformZohoResponse(zohoResponse: any): ClientData {
  console.log('Zoho data adapter - Processing response:', typeof zohoResponse, Object.keys(zohoResponse || {}));
  
  // Handle case where response might be wrapped in additional structure
  const data = zohoResponse?.data || zohoResponse;
  
  // Check if we have tabs in the expected location
  const tabs = data?.tabs || [];
  
  console.log('Zoho data adapter - Found tabs:', tabs.length);
  
  // Process each tab using similar logic to the mock data transformer
  const processedTabs: ProcessedTabData[] = tabs.map((tab: any) => {
    let tabData: RowItem[] = [];
    let hasData = false;
    
    // Check if tab has extracted data
    const extractedData = tab.extracted_data || {};
    
    // Look for table data (auto_detected_table_* keys or other table indicators)
    const tableKey = Object.keys(extractedData).find(key => 
      key.startsWith('auto_detected_table_') && Array.isArray(extractedData[key])
    );
    
    if (tableKey && Array.isArray(extractedData[tableKey])) {
      const tableArray = extractedData[tableKey] as any[];
      
      // Transform each row to match RowItem interface
      tabData = tableArray.map((item: any, index) => {
        // Handle image field separately to avoid type errors
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
      // For tabs without table data, keep them empty
      hasData = false;
    }
    
    return {
      name: tab.sheet_name || tab.name || 'Unknown Tab',
      data: tabData,
      hasData,
      metadata: tab.metadata
    };
  });
  
  console.log('Zoho data adapter - Processed tabs:', 
    processedTabs.map(tab => `${tab.name}: ${tab.data.length} items (hasData: ${tab.hasData})`).join(', ')
  );
  
  // Create client info from the processed data
  const allTabData = processedTabs.flatMap(tab => tab.data);
  const clientInfo = {
    client_name: "TMH Client",
    search_type: "Multi-Source Search", 
    gs_classes: extractClassesFromData(allTabData),
    sic_code: extractSicCodesFromTabs(processedTabs),
    business_nature: "Trademark & Business Intelligence",
    countries: extractCountriesFromData(allTabData),
  };
  
  return {
    client_info: clientInfo,
    tabs: processedTabs,
  };
}

/**
 * Extract unique classes from all tab data
 */
function extractClassesFromData(allData: RowItem[]): string {
  const allClasses = allData
    .map((item: any) => item.classes || '')
    .filter(Boolean)
    .flatMap((classes: string) => classes.split(',').map((c: string) => c.trim()))
    .filter(Boolean);
  
  // Get unique classes and sort numerically
  const uniqueClasses = [...new Set(allClasses)].sort((a: string, b: string) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });
  
  return uniqueClasses.join(', ');
}

/**
 * Extract unique SIC codes from company data
 */
function extractSicCodesFromTabs(tabs: ProcessedTabData[]): string {
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
 * Extract countries from various data sources
 */
function extractCountriesFromData(allData: RowItem[]): string {
  const allCountries: string[] = allData
    .map((item: any) => {
      if (item.office) {
        const match = item.office.match(/\(([^)]+)\)/);
        return match ? match[1] : item.office;
      }
      return item.owner_location || item.country || '';
    })
    .filter((country: string) => Boolean(country));
  
  // Get unique countries
  const uniqueCountries: string[] = [...new Set(allCountries)];
  
  return uniqueCountries.slice(0, 5).join(', ') || "UK";
}