/**
 * Tests Routes
 * GET /api/v1/tests
 * GET /api/v1/tests/:id
 * POST /api/v1/tests
 * PUT /api/v1/tests/:id
 * DELETE /api/v1/tests/:id
 * GET /api/v1/tests/dashboard/stats
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const {
  getAll,
  getById,
  create,
  update,
  deleteTest,
  getDashboardStats,
} = require('../controllers/testsController');

/**
 * GET /api/v1/tests/dashboard/stats
 * Get tests dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/tests
 * Get all tests with pagination and filtering
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/tests/:id
 * Get a specific test
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/tests
 * Create a new test
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/tests/:id
 * Update a test
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/tests/:id
 * Delete a test
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteTest)
);

module.exports = router;
