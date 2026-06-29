/**
 * Structured Logger
 * Provides consistent logging format with tags for traceability
 * Similar to logrus pattern used in Golang projects
 */

const winston = require('winston');

// Custom format for structured logging
const structuredFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let log = `${timestamp} [${level.toUpperCase()}]`;
  
  // Add tag if present
  if (metadata.tag) {
    log += ` [${metadata.tag}]`;
  }
  
  log += `: ${message}`;
  
  // Add other metadata
  const otherMetadata = { ...metadata };
  delete otherMetadata.tag;
  
  if (Object.keys(otherMetadata).length > 0) {
    log += ` ${JSON.stringify(otherMetadata)}`;
  }
  
  return log;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    structuredFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        structuredFormat
      ),
    }),
  ],
});

// Helper methods matching logrus pattern
const loggerWithFields = (fields) => {
  return {
    info: (message) => logger.info(message, fields),
    warn: (message) => logger.warn(message, fields),
    error: (message) => logger.error(message, fields),
    debug: (message) => logger.debug(message, fields),
  };
};

module.exports = {
  logger,
  loggerWithFields,
};
