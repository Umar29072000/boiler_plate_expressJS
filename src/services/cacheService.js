const { getRedisClient, isConnected } = require('../config/redis');
const { logger } = require('../utils/logger');

/**
 * Get value from cache
 */
const get = async (key) => {
  if (!isConnected()) {
    return null;
  }

  try {
    const value = await getRedisClient().get(key);
    return value;
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value in cache with TTL (seconds)
 */
const set = async (key, value, ttl = 300) => {
  if (!isConnected()) {
    return false;
  }

  try {
    await getRedisClient().setEx(key, ttl, value);
    return true;
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete key from cache
 */
const del = async (key) => {
  if (!isConnected()) {
    return false;
  }

  try {
    await getRedisClient().del(key);
    return true;
  } catch (error) {
    logger.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete keys matching pattern
 */
const delPattern = async (pattern) => {
  if (!isConnected()) {
    return 0;
  }

  try {
    const keys = await getRedisClient().keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    await getRedisClient().del(keys);
    return keys.length;
  } catch (error) {
    logger.error(`Cache delete pattern error for ${pattern}:`, error);
    return 0;
  }
};

/**
 * Check if key exists
 */
const exists = async (key) => {
  if (!isConnected()) {
    return false;
  }

  try {
    const result = await getRedisClient().exists(key);
    return result === 1;
  } catch (error) {
    logger.error(`Cache exists error for key ${key}:`, error);
    return false;
  }
};

/**
 * Set TTL for existing key
 */
const expire = async (key, ttl) => {
  if (!isConnected()) {
    return false;
  }

  try {
    await getRedisClient().expire(key, ttl);
    return true;
  } catch (error) {
    logger.error(`Cache expire error for key ${key}:`, error);
    return false;
  }
};

/**
 * Flush all cache
 */
const flush = async () => {
  if (!isConnected()) {
    return false;
  }

  try {
    await getRedisClient().flushDb();
    logger.info('Cache flushed');
    return true;
  } catch (error) {
    logger.error('Cache flush error:', error);
    return false;
  }
};

/**
 * Get cache statistics
 */
const getStats = async () => {
  if (!isConnected()) {
    return null;
  }

  try {
    const info = await getRedisClient().info('stats');
    return info;
  } catch (error) {
    logger.error('Cache stats error:', error);
    return null;
  }
};

module.exports = {
  get,
  set,
  del,
  delPattern,
  exists,
  expire,
  flush,
  getStats,
};
