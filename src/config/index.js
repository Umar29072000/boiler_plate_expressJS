require('dotenv').config();

/**
 * Centralized configuration
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/express_boilerplate',
  },
  
  jwt: {
    accessTokenSecret: process.env.JWT_SECRET || 'your-secret-key',
    accessTokenExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '7',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Express App',
  },
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    enabled: process.env.REDIS_ENABLED !== 'false',
  },
  
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 300,
  },
};

module.exports = config;
