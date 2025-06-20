import { ClientData, SearchItem } from './types';
import responseData from '../data/response.json';

/**
 * Transforms the raw response data from the JSON file into the ClientData format
 * expected by the application
 */
export function transformResponseData(): ClientData {
  // Extract the table data from the response
  const tableData = responseData.extracted_data.auto_detected_table_1 || [];
  
  console.log('Response data adapter - Raw data items:', tableData.length);
  
  // Create search items from the table data
  const searchData: SearchItem[] = tableData.map((item, index) => {
    return {
      id: `search-${index + 1}`,
      search_term: item.mark_text || '',
      search_criteria: mapRelevanceToSearchCriteria(item.relevance),
      remarks: item.remarks || '',
      image: item.image?.base64 || undefined,
      classification: `Class ${item.classes || 'Unknown'}`,
    };
  });

  console.log('Response data adapter - Transformed search items:', searchData.length);

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
 * Maps the relevance field from the response data to the expected search criteria format
 */
function mapRelevanceToSearchCriteria(relevance: string | undefined): 'Identical' | 'Similar' | 'Phonetic' | 'Broad' {
  if (!relevance) return 'Broad';
  
  const lowerRelevance = relevance.toLowerCase();
  
  if (lowerRelevance.includes('identical')) return 'Identical';
  if (lowerRelevance.includes('similar')) return 'Similar';
  if (lowerRelevance.includes('sound')) return 'Phonetic';
  
  return 'Broad';
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
 * Gets client data by ID - currently just returns the transformed response data
 * In the future, this could be extended to handle multiple datasets
 */
export function getResponseDataById(id: string): ClientData | null {
  // For now, we're just returning the same data regardless of ID
  // In a real implementation, you might have different data sets for different IDs
  if (id) {
    return transformResponseData();
  }
  
  return null;
}
