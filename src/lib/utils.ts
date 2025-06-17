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
  try {
    return str.startsWith('data:image/') && str.includes('base64,');
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
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