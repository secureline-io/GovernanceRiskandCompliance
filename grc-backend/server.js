/**
 * GRC Platform Backend Server
 * Main Express.js application entry point
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Internal imports
const { connectDB, disconnectDB } = require('./config/db');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
const { RATE_LIMIT } = require('./config/constants');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const controlsRoutes = require('./routes/controls');
const frameworksRoutes = require('./routes/frameworks');
const policiesRoutes = require('./routes/policies');
const evidencesRoutes = require('./routes/evidences');
const testsRoutes = require('./routes/tests');
const risksRoutes = require('./routes/risks');
const vendorsRoutes = require('./routes/vendors');
const auditsRoutes = require('./routes/audits');
const cloudRoutes = require('./routes/cloud');

// Validate required environment variables
const validateEnv = () => {
  const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }
};

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Connect to MongoDB
 */
const startServer = async () => {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to database
    logger.info('Connecting to MongoDB...');
    await connectDB();

    /**
     * Security Middleware
     */
    // Helmet helps secure Express apps by setting various HTTP headers
    app.use(helmet());

    // CORS middleware - Allow cross-origin requests from specified origins
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 200,
      })
    );

    /**
     * Body Parser Middleware
     */
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    /**
     * Logging Middleware
     */
    // Morgan HTTP request logger
    const morganFormat =
      NODE_ENV === 'production'
        ? 'combined' // Standard Apache combined log output
        : 'dev'; // Concise output colored by response status
    app.use(morgan(morganFormat));

    /**
     * Rate Limiting Middleware
     */
    const generalLimiter = rateLimit({
      windowMs: RATE_LIMIT.WINDOW_MS,
      max: RATE_LIMIT.MAX_REQUESTS,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Don't apply rate limiting to health check
        return req.path === '/health';
      },
    });

    const loginLimiter = rateLimit({
      windowMs: RATE_LIMIT.LOGIN_WINDOW_MS,
      max: RATE_LIMIT.LOGIN_MAX_REQUESTS,
      message: 'Too many login attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use('/api/', generalLimiter);
    app.use('/api/v1/auth/login', loginLimiter);
    app.use('/api/v1/auth/register', loginLimiter);

    /**
     * Health Check Endpoint
     */
    app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
      });
    });

    /**
     * API Routes
     */
    const apiV1 = '/api/v1';

    // Auth routes
    app.use(`${apiV1}/auth`, authRoutes);

    // Dashboard routes
    app.use(`${apiV1}/dashboard`, dashboardRoutes);

    // Controls routes
    app.use(`${apiV1}/controls`, controlsRoutes);

    // Frameworks routes
    app.use(`${apiV1}/frameworks`, frameworksRoutes);

    // Policies routes
    app.use(`${apiV1}/policies`, policiesRoutes);

    // Evidences routes
    app.use(`${apiV1}/evidences`, evidencesRoutes);

    // Tests routes
    app.use(`${apiV1}/tests`, testsRoutes);

    // Risks routes
    app.use(`${apiV1}/risks`, risksRoutes);

    // Vendors routes
    app.use(`${apiV1}/vendors`, vendorsRoutes);

    // Audits routes
    app.use(`${apiV1}/audits`, auditsRoutes);

    // Cloud routes
    app.use(`${apiV1}/cloud`, cloudRoutes);

    /**
     * Static Files
     */
    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, 'public')));

    /**
     * 404 Not Found Handler
     */
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
      });
    });

    /**
     * Global Error Handler
     * Must be the last middleware
     */
    app.use(errorHandler);

    /**
     * Start Server
     */
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api/v1`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });

    /**
     * Graceful Shutdown Handler
     */
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      // Stop accepting new requests
      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        try {
          await disconnectDB();
          logger.info('Database disconnected');
          process.exit(0);
        } catch (error) {
          logger.error(`Error during graceful shutdown: ${error.message}`);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Handle various shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    /**
     * Unhandled Promise Rejection Handler
     */
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', {
        promise: String(promise),
        reason: String(reason),
      });
    });

    /**
     * Uncaught Exception Handler
     */
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
