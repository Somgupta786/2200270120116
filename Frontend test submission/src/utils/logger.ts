// Comprehensive Logging Middleware for URL Shortener
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
  sessionId: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private maxLogs = 1000;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.info('Logger initialized', 'SYSTEM');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      sessionId: this.sessionId
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the latest logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also output to console for development
    const consoleMessage = `[${entry.level}] ${entry.timestamp} - ${entry.context || 'APP'}: ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(consoleMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(consoleMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(consoleMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(consoleMessage, entry.data);
        break;
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.DEBUG, message, context, data));
  }

  info(message: string, context?: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.INFO, message, context, data));
  }

  warn(message: string, context?: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.WARN, message, context, data));
  }

  error(message: string, context?: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.ERROR, message, context, data));
  }

  // Get filtered logs
  getLogs(level?: LogLevel, context?: string): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (context) {
      filteredLogs = filteredLogs.filter(log => log.context === context);
    }

    return filteredLogs;
  }

  // Get all logs
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared', 'SYSTEM');
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger();

// Utility functions for common logging scenarios
export const logUrlShortening = (originalUrl: string, shortCode: string, validity: number) => {
  logger.info(`URL shortened: ${originalUrl} -> ${shortCode}`, 'URL_SHORTENER', {
    originalUrl,
    shortCode,
    validityMinutes: validity
  });
};

export const logUrlAccess = (shortCode: string, originalUrl: string, source?: string, location?: string) => {
  logger.info(`Short URL accessed: ${shortCode} -> ${originalUrl}`, 'URL_ACCESS', {
    shortCode,
    originalUrl,
    source,
    location,
    timestamp: new Date().toISOString()
  });
};

export const logError = (operation: string, error: Error | string, context?: any) => {
  logger.error(`Operation failed: ${operation}`, 'ERROR_HANDLER', {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    context
  });
};

export const logValidation = (field: string, value: any, isValid: boolean, reason?: string) => {
  const message = `Validation ${isValid ? 'passed' : 'failed'}: ${field}`;
  const data = { field, value, isValid, reason };
  
  if (isValid) {
    logger.debug(message, 'VALIDATION', data);
  } else {
    logger.warn(message, 'VALIDATION', data);
  }
};
