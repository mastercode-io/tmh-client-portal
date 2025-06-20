import { ClientData, RowItem } from './types';
import responseData from '../data/response.json';

/**
 * Transforms the raw response data from the JSON file into the ClientData format
 * expected by the application while preserving original field structure
 */
export function transformResponseData(): ClientData {
  // Extract the table data from the response
  const tableData = responseData.extracted_data.auto_detected_table_1 || [];
  
  console.log('Response data adapter - Raw data items:', tableData.length);
  
  // Create row items from the table data with minimal transformation
  const searchData: RowItem[] = tableData.map((item, index) => {
    // Extract image data if it exists
    let imageData: string | undefined = undefined;
    if (item.image) {
      if (typeof item.image === 'object' && 'base64' in item.image) {
        imageData = item.image.base64;
      } else if (typeof item.image === 'string') {
        imageData = item.image;
      }
    }
    
    // Create a new object without the image property
    const { image, ...rest } = item;
    
    // Add an id if not present and include the properly formatted image
    const rowItem: RowItem = { 
      ...rest, 
      id: item.app_number || `row-${index + 1}`,
      ...(imageData ? { image: imageData } : {})
    };
    
    return rowItem;
  });

  console.log('Response data adapter - Transformed row items:', searchData.length);

  // Create client info from the first item (or use defaults)
  const firstItem = tableData[0] || {};
  
  const clientInfo = {
    client_name: "TMH Client", // Default client name
    search_type: "Trademark Search",
    gs_classes: extractClasses(tableData),
    sic_code: firstItem.industry || "N/A",
    business_nature: firstItem.industry || "Trademark Management",
    countries: extractCountries(tableData),
  };

  return {
    client_info: clientInfo,
    search_data: searchData,
  };
}

/**
 * Extracts unique classes from all items and formats them as a comma-separated string
 */
function extractClasses(items: any[]): string {
  const allClasses = items
    .map(item => item.classes || '')
    .filter(Boolean)
    .flatMap(classes => classes.split(',').map(c => c.trim()))
    .filter(Boolean);
  
  // Get unique classes
  const uniqueClasses = [...new Set(allClasses)].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });
  
  return uniqueClasses.join(', ');
}

/**
 * Extracts unique countries from all items and formats them as a comma-separated string
 */
function extractCountries(items: any[]): string {
  const allCountries = items
    .map(item => {
      if (item.office) {
        const match = item.office.match(/\(([^)]+)\)/);
        return match ? match[1] : item.office;
      }
      return item.owner_location || '';
    })
    .filter(Boolean);
  
  // Get unique countries
  const uniqueCountries = [...new Set(allCountries)];
  
  return uniqueCountries.join(', ');
}

/**
 * Gets response data by ID (currently returns the same data regardless of ID)
 */
export function getResponseDataById(id: string): ClientData {
  return transformResponseData();
}
