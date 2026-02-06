/**
 * Logger Utility
 * Provides structured logging for the application
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}`.trim();
};

const writeToFile = (filename, message) => {
  const filepath = path.join(logsDir, filename);
  fs.appendFileSync(filepath, message + '\n', (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err.message}`);
    }
  });
};

const logger = {
  /**
   * Log info level messages
   */
  info: (message, meta = {}) => {
    const formatted = formatLogMessage('INFO', message, meta);
    console.log(formatted);
    writeToFile('app.log', formatted);
  },

  /**
   * Log warning level messages
   */
  warn: (message, meta = {}) => {
    const formatted = formatLogMessage('WARN', message, meta);
    console.warn(formatted);
    writeToFile('app.log', formatted);
  },

  /**
   * Log error level messages
   */
  error: (message, meta = {}) => {
    const formatted = formatLogMessage('ERROR', message, meta);
    console.error(formatted);
    writeToFile('error.log', formatted);
    writeToFile('app.log', formatted);
  },

  /**
   * Log debug level messages (only in development)
   */
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const formatted = formatLogMessage('DEBUG', message, meta);
      console.log(formatted);
      writeToFile('app.log', formatted);
    }
  },

  /**
   * Log HTTP requests
   */
  http: (method, url, statusCode, duration) => {
    const message = `${method} ${url} - ${statusCode} - ${duration}ms`;
    const formatted = formatLogMessage('HTTP', message);
    console.log(formatted);
    writeToFile('http.log', formatted);
  },
};

module.exports = logger;
