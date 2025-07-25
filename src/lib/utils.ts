import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateBase64Image(color: string, width = 100, height = 100): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Add some pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(10, 10, width - 20, height - 20);
  
  return canvas.toDataURL('image/png');
}

export function isValidBase64Image(str: string): boolean {
  // First, check if the string is defined and has the correct format
  if (!str || typeof str !== 'string') {
    console.log('Image validation failed: string is undefined or not a string');
    return false;
  }
  
  // Check if it starts with the data:image prefix
  if (!str.startsWith('data:image/')) {
    console.log('Image validation failed: missing data:image/ prefix');
    return false;
  }
  
  // Check if it contains the base64 marker
  if (!str.includes('base64,')) {
    console.log('Image validation failed: missing base64, marker');
    return false;
  }
  
  try {
    // Extract the actual base64 content (after the comma)
    const base64Content = str.split('base64,')[1];
    
    // Check if there's actual content
    if (!base64Content || base64Content.length === 0) {
      console.log('Image validation failed: empty base64 content');
      return false;
    }
    
    // Check if the base64 content has a reasonable length
    // Even tiny 1x1 pixel images should have some content
    // Removed the minimum length check as we're now using very small images
    
    // Check if the base64 content contains only valid base64 characters
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(base64Content)) {
      console.log('Image validation failed: invalid base64 characters');
      return false;
    }
    
    // If we got here, the image data looks valid
    return true;
  } catch (error) {
    console.log('Image validation error:', error);
    return false;
  }
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (..._args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function sortData<T>(
  data: T[],
  key: keyof T,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function filterData<T extends Record<string, string | number | Date | undefined>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return data;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return data.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseSearch);
      }
      return false;
    })
  );
}