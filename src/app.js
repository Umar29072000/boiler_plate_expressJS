const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const compression = require('compression');
const mongoose = require('mongoose');
const { morganMiddleware } = require('./utils/logger');
const { getRedisClient, isConnected } = require('./config/redis');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security Middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting with Redis (if available)
const limiterConfig = {
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};

// Use Redis store if connected, otherwise use memory store
if (isConnected()) {
  limiterConfig.store = new RedisStore({
    client: getRedisClient(),
    prefix: 'rl:',
  });
}

const limiter = rateLimit(limiterConfig);
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Compression
app.use(compression());

// Logging
app.use(morganMiddleware);

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
    services: {
      mongodb: 'unknown',
      redis: 'unknown',
    },
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.services.mongodb = 'connected';
    } else {
      health.services.mongodb = 'disconnected';
      health.status = 'DEGRADED';
    }
  } catch (error) {
    health.services.mongodb = 'error';
    health.status = 'DEGRADED';
  }

  // Check Redis
  try {
    if (isConnected()) {
      await getRedisClient().ping();
      health.services.redis = 'connected';
    } else {
      health.services.redis = 'disconnected';
    }
  } catch (error) {
    health.services.redis = 'error';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Express.js Backend Boilerplate API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
