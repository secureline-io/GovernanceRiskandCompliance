/**
 * Global Error Handler Middleware
 * Catches and formats all errors across the application
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Should be used as the last middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  // Log the error
  logger.error('Request Error', {
    statusCode: err.statusCode,
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    stack: err.stack,
  });

  // Handle specific MongoDB validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    err.message = `Validation Error: ${errors.join(', ')}`;
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.statusCode = HTTP_STATUS.CONFLICT;
    err.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    err.message = ERROR_MESSAGES.INVALID_TOKEN;
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    err.message = ERROR_MESSAGES.TOKEN_EXPIRED;
  }

  // Handle CastError (invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    err.message = `Invalid ${err.path}`;
  }

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors }),
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch Promise rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
};
