const morgan = require('morgan');

/**
 * Custom logger configuration
 */
const logger = {
  info: (message) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
  },
  
  error: (message, error = null) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
      if (error) {
        console.error(error);
      }
    }
  },
  
  warn: (message) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
  },
  
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  },
};

/**
 * Morgan middleware configuration
 */
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    skip: () => process.env.NODE_ENV === 'test',
  }
);

module.exports = { logger, morganMiddleware };
