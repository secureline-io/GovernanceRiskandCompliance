/**
 * Audits Routes
 * GET /api/v1/audits
 * GET /api/v1/audits/:id
 * POST /api/v1/audits
 * PUT /api/v1/audits/:id
 * DELETE /api/v1/audits/:id
 * POST /api/v1/audits/:id/findings
 * POST /api/v1/audits/:id/requests
 * POST /api/v1/audits/:id/corrective-actions
 * GET /api/v1/audits/dashboard/stats
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
  deleteAudit,
  addFinding,
  addRequest,
  addCorrectiveAction,
  getDashboardStats,
} = require('../controllers/auditsController');

/**
 * GET /api/v1/audits/dashboard/stats
 * Get audits dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/audits
 * Get all audits with pagination and filtering
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/audits/:id
 * Get a specific audit
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/audits
 * Create a new audit
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/audits/:id
 * Update an audit
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/audits/:id
 * Delete an audit
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteAudit)
);

/**
 * POST /api/v1/audits/:id/findings
 * Add finding to audit
 * Protected route - admin and manager only
 */
router.post(
  '/:id/findings',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(addFinding)
);

/**
 * POST /api/v1/audits/:id/requests
 * Add request to audit
 * Protected route - admin and manager only
 */
router.post(
  '/:id/requests',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(addRequest)
);

/**
 * POST /api/v1/audits/:id/corrective-actions
 * Add corrective action to audit
 * Protected route - admin and manager only
 */
router.post(
  '/:id/corrective-actions',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(addCorrectiveAction)
);

module.exports = router;
