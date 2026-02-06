/**
 * Controls Routes
 * GET /api/v1/controls
 * GET /api/v1/controls/:id
 * POST /api/v1/controls
 * PUT /api/v1/controls/:id
 * DELETE /api/v1/controls/:id
 * GET /api/v1/controls/dashboard/stats
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
  deleteControl,
  getDashboardStats,
} = require('../controllers/controlsController');

/**
 * GET /api/v1/controls/dashboard/stats
 * Get controls dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/controls
 * Get all controls with pagination and filtering
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/controls/:id
 * Get a specific control
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/controls
 * Create a new control
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/controls/:id
 * Update a control
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/controls/:id
 * Delete a control
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteControl)
);

module.exports = router;
