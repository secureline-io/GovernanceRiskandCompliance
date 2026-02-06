const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB Connection Configuration
 * Handles connection, reconnection, and graceful shutdown
 */

const connectDB = async () => {
  const maxRetries = 5;
  const retryInterval = 5000; // 5 seconds
  let retries = 0;

  const attemptConnection = async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
      });

      logger.info(
        `MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
      );

      // Connection event listeners
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        logger.error(`Mongoose connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected from MongoDB');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('Mongoose reconnected to MongoDB');
      });

      return conn;
    } catch (error) {
      retries += 1;

      if (retries < maxRetries) {
        logger.warn(
          `MongoDB connection failed (attempt ${retries}/${maxRetries}). Retrying in ${
            retryInterval / 1000
          }s...`
        );
        logger.error(`Connection error: ${error.message}`);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
        return attemptConnection();
      } else {
        logger.error(
          `Failed to connect to MongoDB after ${maxRetries} attempts. Exiting...`
        );
        logger.error(`Final error: ${error.message}`);
        process.exit(1);
      }
    }
  };

  return attemptConnection();
};

/**
 * Graceful shutdown handler
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected through app termination');
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
