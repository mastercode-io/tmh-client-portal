// Client-side logger that works in browser environment
// This is a simplified version of the logger that doesn't use Node.js file system

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  requestId?: string;
  jobId?: string;
  context?: string;
}

class ClientLogger {
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.logLevel = 'info'; // Default for client-side
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    const LOG_LEVELS = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    };
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  private log(level: LogLevel, message: string, data?: any, metadata?: Partial<LogEntry>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...metadata
    };

    // Console output based on level and environment
    if (level === 'error' || level === 'warn') {
      const consoleMethod = level === 'error' ? console.error : console.warn;
      consoleMethod(`[${level.toUpperCase()}]`, message, data || '');
    } else if (!this.isProduction && level === 'info') {
      console.log(`[INFO]`, message);
    } else if (!this.isProduction && level === 'debug') {
      console.log(`[DEBUG]`, message, data || '');
    }
  }

  // Public logging methods
  error(message: string, data?: any, metadata?: Partial<LogEntry>): void {
    this.log('error', message, data, metadata);
  }

  warn(message: string, data?: any, metadata?: Partial<LogEntry>): void {
    this.log('warn', message, data, metadata);
  }

  info(message: string, data?: any, metadata?: Partial<LogEntry>): void {
    this.log('info', message, data, metadata);
  }

  debug(message: string, data?: any, metadata?: Partial<LogEntry>): void {
    this.log('debug', message, data, metadata);
  }

  trace(message: string, data?: any, metadata?: Partial<LogEntry>): void {
    this.log('trace', message, data, metadata);
  }

  // API Request logging with headers (including API keys)
  logApiRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: any,
    requestId?: string,
    jobId?: string
  ): void {
    // For client-side, we don't log sensitive headers
    const safeHeaders = { ...headers };
    Object.keys(safeHeaders).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('authorization') || lowerKey.includes('api-key') || lowerKey.includes('token')) {
        safeHeaders[key] = '[REDACTED]';
      }
    });
    
    const requestData = {
      method,
      url,
      headers: safeHeaders,
      ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) })
    };

    this.debug(`API Request: ${method} ${url}`, requestData, {
      requestId,
      jobId,
      context: 'api-request'
    });
  }

  // API Response logging with timing
  logApiResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    responseBody?: any,
    requestId?: string,
    jobId?: string
  ): void {
    const responseData = {
      method,
      url,
      statusCode,
      duration,
      success: statusCode >= 200 && statusCode < 300,
      ...(responseBody && { responseBody })
    };

    const level = statusCode >= 400 ? 'error' : 'debug';
    this[level](`API Response: ${method} ${url} - ${statusCode} (${duration}ms)`, responseData, {
      requestId,
      jobId,
      context: 'api-response'
    });
  }
}

// Export singleton instance
export const logger = new ClientLogger();

// Export types for use in other files
export type { LogLevel, LogEntry };