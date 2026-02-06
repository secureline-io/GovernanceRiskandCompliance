/**
 * Evidences Routes
 * GET /api/v1/evidences
 * GET /api/v1/evidences/:id
 * POST /api/v1/evidences
 * PUT /api/v1/evidences/:id
 * DELETE /api/v1/evidences/:id
 * GET /api/v1/evidences/dashboard/stats
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
  deleteEvidence,
  getDashboardStats,
} = require('../controllers/evidencesController');

/**
 * GET /api/v1/evidences/dashboard/stats
 * Get evidences dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/evidences
 * Get all evidences with pagination and filtering
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/evidences/:id
 * Get a specific evidence
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/evidences
 * Create a new evidence record
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/evidences/:id
 * Update an evidence record
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/evidences/:id
 * Delete an evidence record
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteEvidence)
);

module.exports = router;
