const cacheService = require('../services/cacheService');
const { logger } = require('../utils/logger');

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default: 5 minutes)
 */
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from request URL and query params
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      logger.debug(`Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache response
      res.json = (data) => {
        // Cache the response
        cacheService.set(cacheKey, JSON.stringify(data), duration)
          .catch(err => logger.error('Error caching response:', err));

        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      // If Redis fails, continue without cache
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache for specific patterns after data modification
 */
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original json/send functions
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override to invalidate cache after successful response
    const invalidate = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const pattern of patterns) {
          try {
            const deleted = await cacheService.delPattern(pattern);
            if (deleted > 0) {
              logger.debug(`Invalidated ${deleted} cache entries for pattern: ${pattern}`);
            }
          } catch (error) {
            logger.error(`Error invalidating cache for pattern ${pattern}:`, error);
          }
        }
      }
      return data;
    };

    res.json = async (data) => {
      await invalidate(data);
      return originalJson(data);
    };

    res.send = async (data) => {
      await invalidate(data);
      return originalSend(data);
    };

    next();
  };
};

module.exports = {
  cache,
  invalidateCache,
};
