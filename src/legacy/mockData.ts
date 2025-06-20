import { ClientData, SearchItem } from './types';

// Simplified base64 images that are guaranteed to work
export function generateSimpleBase64Image(color: string): string {
  // Create a simple 1x1 colored pixel as base64
  const colors: Record<string, string> = {
    red: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    blue: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==',
    green: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    orange: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    purple: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='
  };
  
  return `data:image/png;base64,${colors[color] || colors.blue}`;
}

const companies = [
  'TechCorp Solutions', 'Digital Innovations Ltd', 'Global Manufacturing Inc',
  'Premier Consulting Group', 'NextGen Technologies', 'Urban Retail Chain',
  'Elite Financial Services', 'Advanced Systems Corp', 'Modern Logistics Co',
  'Creative Design Studio', 'Quantum Computing Ltd', 'Sustainable Energy Inc',
  'HealthTech Solutions', 'Smart Automation Systems', 'Cloud Services Pro',
  'Data Analytics Hub', 'Wireless Communications', 'Green Technology Corp',
  'Precision Manufacturing', 'Digital Marketing Agency', 'Cyber Security Firm',
  'AI Research Institute', 'Robotics Engineering', 'Blockchain Ventures',
  'Virtual Reality Studios', 'Renewable Energy Co', 'BioTech Innovations',
  'Space Technology Ltd', 'Ocean Sciences Corp', 'Nano Materials Inc'
];

const searchTerms = [
  'InnovateX', 'TechFlow', 'DataSync', 'CloudMaster', 'SecureLink', 'SmartGrid',
  'AutoPilot', 'VisionPro', 'EcoSmart', 'PowerMax', 'FlexCore', 'NetGuard',
  'SyncPoint', 'MetaCore', 'HyperSync', 'ProActive', 'MaxFlow', 'OptiCore',
  'FastTrack', 'SmartSync', 'TurboMax', 'EliteCore', 'PrimeSync', 'UltraMax',
  'SpeedCore', 'FlexMax', 'ProSync', 'MegaCore', 'SuperMax', 'HyperCore',
  'EliteMax', 'PrimeCore', 'UltraSync', 'TurboCore', 'FastMax', 'SpeedSync',
  'FlexCore', 'ProMax', 'MegaSync', 'SuperCore', 'HyperMax', 'EliteSync',
  'PrimeMax', 'UltraCore', 'TurboSync', 'FastCore', 'SpeedMax', 'FlexSync',
  'ProCore', 'MegaMax', 'SuperSync', 'HyperCore', 'EliteMax', 'PrimeSync',
  'UltraMax', 'TurboCore', 'FastSync', 'SpeedCore', 'FlexMax', 'ProSync',
  'MegaCore', 'SuperMax', 'HyperSync', 'EliteCore', 'PrimeMax', 'UltraSync',
  'TurboMax', 'FastCore', 'SpeedSync', 'FlexCore', 'ProMax', 'MegaSync',
  'SuperCore', 'HyperMax', 'EliteSync', 'PrimeCore', 'UltraMax', 'TurboSync',
  'FastMax', 'SpeedCore', 'FlexSync', 'ProCore', 'MegaMax', 'SuperSync',
  'HyperCore', 'EliteMax', 'PrimeSync', 'UltraCore', 'TurboMax', 'FastSync',
  'SpeedMax', 'FlexCore', 'ProSync', 'MegaCore', 'SuperMax', 'HyperSync',
  'EliteCore', 'PrimeMax', 'UltraSync', 'TurboCore', 'FastMax', 'SpeedSync'
];

const criteria = ['Identical', 'Similar', 'Phonetic', 'Broad'] as const;
const classifications = [
  'Class 9 - Computer Software', 'Class 35 - Business Services', 'Class 42 - Technology Services',
  'Class 1 - Chemicals', 'Class 5 - Pharmaceuticals', 'Class 7 - Machinery',
  'Class 12 - Vehicles', 'Class 25 - Clothing', 'Class 29 - Food Products',
  'Class 32 - Beverages', 'Class 36 - Financial Services', 'Class 39 - Transportation',
  'Class 41 - Education', 'Class 44 - Medical Services', 'Class 45 - Legal Services'
];

const remarks = [
  'Strong similarity in visual appearance and sound',
  'Potential confusion in marketplace',
  'Different industry sectors reduce conflict risk',
  'Phonetic similarity may cause consumer confusion',
  'Identical spelling but different classification',
  'Similar meaning and commercial impression',
  'Different target markets minimize overlap',
  'Strong visual and conceptual similarity',
  'Potential for dilution of trademark rights',
  'Complementary goods may cause confusion',
  'Descriptive elements reduce trademark strength',
  'Surname similarity requires careful analysis',
  'Geographic proximity increases conflict risk',
  'Different channels of trade reduce likelihood',
  'Stylistic differences may prevent confusion',
  'Common prefix creates association risk',
  'Suffix variation insufficient to avoid conflict',
  'Conceptual similarity in brand messaging',
  'Historical usage patterns show coexistence',
  'Translation equivalents in different languages',
  'Abbreviation creates potential conflict',
  'Domain name availability concerns',
  'Social media handle conflicts identified',
  'International registration implications',
  'Renewal timeline considerations',
  'Opposition period monitoring required',
  'Licensing opportunities may exist',
  'Coexistence agreement potential',
  'Watching service recommendations',
  'Portfolio management implications'
];

const colors = ['red', 'blue', 'green', 'orange', 'purple'];

function generateRandomDate(): string {
  const start = new Date(2022, 0, 1);
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString();
}

function generateSearchData(): SearchItem[] {
  const data: SearchItem[] = [];
  
  for (let i = 0; i < 100; i++) {
    const hasImage = Math.random() < 0.5; // 50% chance of having an image
    const item: SearchItem = {
      id: `search-${i + 1}`,
      search_term: searchTerms[Math.floor(Math.random() * searchTerms.length)],
      search_criteria: criteria[Math.floor(Math.random() * criteria.length)],
      remarks: remarks[Math.floor(Math.random() * remarks.length)],
      classification: classifications[Math.floor(Math.random() * classifications.length)],
      created_date: generateRandomDate(),
    };
    
    if (hasImage) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      item.image = generateSimpleBase64Image(color);
    }
    
    data.push(item);
  }
  
  return data;
}

export const mockClientData: ClientData = {
  client_info: {
    client_name: 'TechCorp Solutions Ltd',
    search_type: 'Comprehensive Trademark Search',
    gs_classes: '9, 35, 42',
    sic_code: '7372',
    business_nature: 'Computer Software Development and Consulting',
    countries: 'United States, Canada, United Kingdom, European Union',
  },
  search_data: generateSearchData(),
};

export function getMockDataById(id: string): ClientData | null {
  // In a real application, this would fetch data based on the ID
  // For demo purposes, we'll return the same mock data but with a different client name
  if (id === 'sample-client-123') {
    return mockClientData;
  }
  
  if (id === 'demo-client-456') {
    return {
      ...mockClientData,
      client_info: {
        ...mockClientData.client_info,
        client_name: 'Demo Corporation Inc',
        search_type: 'Basic Trademark Search',
        business_nature: 'Digital Marketing and E-commerce',
      },
    };
  }
  
  return null;
}