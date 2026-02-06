/**
 * Risks Routes
 * GET /api/v1/risks
 * GET /api/v1/risks/:id
 * POST /api/v1/risks
 * PUT /api/v1/risks/:id
 * DELETE /api/v1/risks/:id
 * GET /api/v1/risks/dashboard/stats
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
  deleteRisk,
  getDashboardStats,
} = require('../controllers/risksController');

/**
 * GET /api/v1/risks/dashboard/stats
 * Get risks dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/risks
 * Get all risks with pagination and filtering
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/risks/:id
 * Get a specific risk
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/risks
 * Create a new risk
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/risks/:id
 * Update a risk
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/risks/:id
 * Delete a risk
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteRisk)
);

module.exports = router;
