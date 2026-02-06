/**
 * Frameworks Routes
 * GET /api/v1/frameworks
 * GET /api/v1/frameworks/:id
 * POST /api/v1/frameworks
 * PUT /api/v1/frameworks/:id
 * DELETE /api/v1/frameworks/:id
 * POST /api/v1/frameworks/:id/recalculate-compliance
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
  deleteFramework,
  recalculateCompliance,
} = require('../controllers/frameworksController');

/**
 * GET /api/v1/frameworks
 * Get all frameworks
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/frameworks/:id
 * Get a specific framework
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/frameworks
 * Create a new framework
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/frameworks/:id
 * Update a framework
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/frameworks/:id
 * Delete a framework
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteFramework)
);

/**
 * POST /api/v1/frameworks/:id/recalculate-compliance
 * Recalculate compliance stats for a framework
 * Protected route - admin and manager only
 */
router.post(
  '/:id/recalculate-compliance',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(recalculateCompliance)
);

module.exports = router;
