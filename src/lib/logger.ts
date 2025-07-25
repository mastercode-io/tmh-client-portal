import fs from 'fs';
import path from 'path';

// Log levels (lower number = higher priority)
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  requestId?: string;
  jobId?: string;
  context?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logToFile: boolean;
  private logDir: string;
  private isProduction: boolean;
  private currentDate: string;

  constructor() {
    // Environment configuration with safe defaults
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.logToFile = process.env.LOG_TO_FILE === 'true' && process.env.NODE_ENV !== 'production';
    this.logDir = process.env.LOG_DIR || 'logs';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.currentDate = new Date().toISOString().split('T')[0];

    // Ensure log directory exists (local dev only)
    if (this.logToFile && typeof window === 'undefined') {
      this.ensureLogDirectory();
    }
  }

  private ensureLogDirectory(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Failed to create log directory:', error);
      this.logToFile = false;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.isProduction) {
      // Structured JSON for production (easy to parse)
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const { timestamp, level, message, requestId, jobId, context, data } = entry;
      let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      
      if (context) formatted += ` (${context})`;
      if (requestId) formatted += ` [req:${requestId.substring(0, 8)}...]`;
      if (jobId) formatted += ` [job:${jobId}]`;
      
      if (data && typeof data === 'object') {
        formatted += '\n' + JSON.stringify(data, null, 2);
      } else if (data) {
        formatted += ` | ${data}`;
      }
      
      return formatted;
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.logToFile || typeof window !== 'undefined') return;

    try {
      const filename = `client-data-${this.currentDate}.log`;
      const filepath = path.join(this.logDir, filename);
      const logLine = this.formatLogEntry(entry) + '\n';
      
      fs.appendFileSync(filepath, logLine, 'utf8');
      
      // Rotate log file if it gets too large (>10MB)
      this.rotateLogIfNeeded(filepath);
    } catch (error) {
      console.warn('Failed to write to log file:', error);
    }
  }

  private rotateLogIfNeeded(filepath: string): void {
    try {
      const stats = fs.statSync(filepath);
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (stats.size > maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = filepath.replace('.log', `-${timestamp}.log`);
        fs.renameSync(filepath, rotatedPath);
        
        // Keep only last 5 rotated files
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.warn('Failed to rotate log file:', error);
    }
  }

  private cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.startsWith('client-data-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          mtime: fs.statSync(path.join(this.logDir, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Keep only the 5 most recent files
      files.slice(5).forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      console.warn('Failed to cleanup old logs:', error);
    }
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

    // Always write to file if enabled (includes all debug data)
    this.writeToFile(entry);

    // Console output based on level and environment
    if (level === 'error' || level === 'warn') {
      // Always show errors and warnings in console
      const consoleMethod = level === 'error' ? console.error : console.warn;
      consoleMethod(`[${level.toUpperCase()}]`, message, data || '');
    } else if (!this.isProduction && level === 'info') {
      // Show info in console for development
      console.log(`[INFO]`, message);
    }
    // Debug and trace levels only go to file, not console (to reduce noise)
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

  // Convenience methods for API context
  apiStart(requestId: string, endpoint: string): void {
    this.info(`API request started: ${endpoint}`, null, { 
      requestId, 
      context: 'api-start' 
    });
  }

  apiEnd(requestId: string, endpoint: string, duration: number): void {
    this.info(`API request completed: ${endpoint} (${duration}ms)`, null, { 
      requestId, 
      context: 'api-end' 
    });
  }

  jobStart(jobId: string, requestId?: string): void {
    this.info(`Job started: ${jobId}`, null, { 
      jobId, 
      requestId, 
      context: 'job-start' 
    });
  }

  jobStatus(jobId: string, status: string, progress?: number, requestId?: string): void {
    this.debug(`Job status: ${status}`, { progress }, { 
      jobId, 
      requestId, 
      context: 'job-status' 
    });
  }

  jobComplete(jobId: string, requestId?: string): void {
    this.info(`Job completed: ${jobId}`, null, { 
      jobId, 
      requestId, 
      context: 'job-complete' 
    });
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
    // Mask sensitive headers for security
    const maskedHeaders = this.maskSensitiveHeaders(headers);
    
    const requestData = {
      method,
      url,
      headers: maskedHeaders,
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

  // Helper method to mask sensitive data in headers
  private maskSensitiveHeaders(headers: Record<string, string>): Record<string, string> {
    const masked = { ...headers };
    const sensitiveKeys = ['authorization', 'x-api-key', 'api-key', 'bearer', 'token'];
    
    Object.keys(masked).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        const value = masked[key];
        if (value && value.length > 8) {
          // Show first 4 and last 4 characters with asterisks in between
          masked[key] = value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
        } else if (value) {
          // For shorter values, just show first character and asterisks
          masked[key] = value.substring(0, 1) + '*'.repeat(value.length - 1);
        }
      }
    });
    
    return masked;
  }

  // Payload logging (only to file, never console)
  logPayload(name: string, payload: any, requestId?: string, jobId?: string): void {
    this.debug(`Payload: ${name}`, payload, { 
      requestId, 
      jobId, 
      context: 'payload' 
    });
  }

  // Configuration info
  getConfig(): Record<string, any> {
    return {
      logLevel: this.logLevel,
      logToFile: this.logToFile,
      logDir: this.logDir,
      isProduction: this.isProduction,
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry };