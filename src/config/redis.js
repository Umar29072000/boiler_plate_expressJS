const redis = require('redis');
const { logger } = require('../utils/logger');
const config = require('./index');

let redisClient = null;
let isRedisConnected = false;

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  // Skip if Redis disabled
  if (!config.redis.enabled) {
    logger.info('Redis is disabled');
    return null;
  }

  try {
    redisClient = redis.createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection attempts exceeded');
            return new Error('Redis reconnection failed');
          }
          return retries * 100; // Exponential backoff
        },
      },
    });

    // Event handlers
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis connected and ready');
      isRedisConnected = true;
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
      isRedisConnected = false;
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection closed');
      isRedisConnected = false;
    });

    // Connect
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    // Don't fail app startup if Redis unavailable
    return null;
  }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Check if Redis is connected
 */
const isConnected = () => {
  return isRedisConnected && redisClient && redisClient.isReady;
};

/**
 * Graceful shutdown
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis disconnected');
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isConnected,
  disconnectRedis,
};
