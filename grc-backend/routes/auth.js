/**
 * Authentication Routes
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * GET /api/v1/auth/me
 * PUT /api/v1/auth/profile
 * POST /api/v1/auth/change-password
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

/**
 * POST /api/v1/auth/register
 * Register a new user
 * Public route
 */
router.post('/register', asyncHandler(register));

/**
 * POST /api/v1/auth/login
 * User login
 * Public route
 */
router.post('/login', asyncHandler(login));

/**
 * GET /api/v1/auth/me
 * Get current user profile
 * Protected route
 */
router.get('/me', protect, asyncHandler(getMe));

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 * Protected route
 */
router.put('/profile', protect, asyncHandler(updateProfile));

/**
 * POST /api/v1/auth/change-password
 * Change user password
 * Protected route
 */
router.post('/change-password', protect, asyncHandler(changePassword));

module.exports = router;
