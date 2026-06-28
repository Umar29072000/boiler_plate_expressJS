const app = require('./src/app');
const connectDB = require('./src/config/database');
const { connectRedis, disconnectRedis } = require('./src/config/redis');
const { logger } = require('./src/utils/logger');
const config = require('./src/config');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Connect to database
connectDB();

// Connect to Redis
connectRedis().catch(err => {
  logger.error('Redis connection failed, continuing without Redis:', err);
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await disconnectRedis();
    logger.info('Process terminated!');
  });
});
