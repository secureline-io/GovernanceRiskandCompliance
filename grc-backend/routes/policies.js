/**
 * Policies Routes
 * GET /api/v1/policies
 * GET /api/v1/policies/:id
 * POST /api/v1/policies
 * PUT /api/v1/policies/:id
 * DELETE /api/v1/policies/:id
 * GET /api/v1/policies/dashboard/stats
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
  deletePolicy,
  getDashboardStats,
} = require('../controllers/policiesController');

/**
 * GET /api/v1/policies/dashboard/stats
 * Get policies dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/policies
 * Get all policies with pagination and filtering
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/policies/:id
 * Get a specific policy
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/policies
 * Create a new policy
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/policies/:id
 * Update a policy
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/policies/:id
 * Delete a policy
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deletePolicy)
);

module.exports = router;
