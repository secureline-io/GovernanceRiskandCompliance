/**
 * Vendors Routes
 * GET /api/v1/vendors
 * GET /api/v1/vendors/:id
 * POST /api/v1/vendors
 * PUT /api/v1/vendors/:id
 * DELETE /api/v1/vendors/:id
 * GET /api/v1/vendors/dashboard/stats
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
  deleteVendor,
  getDashboardStats,
} = require('../controllers/vendorsController');

/**
 * GET /api/v1/vendors/dashboard/stats
 * Get vendors dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/dashboard/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/vendors
 * Get all vendors with pagination and filtering
 * Protected route - all authenticated users can access
 */
router.get('/', protect, asyncHandler(getAll));

/**
 * GET /api/v1/vendors/:id
 * Get a specific vendor
 * Protected route - all authenticated users can access
 */
router.get('/:id', protect, asyncHandler(getById));

/**
 * POST /api/v1/vendors
 * Create a new vendor
 * Protected route - admin and manager only
 */
router.post(
  '/',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(create)
);

/**
 * PUT /api/v1/vendors/:id
 * Update a vendor
 * Protected route - admin and manager only
 */
router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(update)
);

/**
 * DELETE /api/v1/vendors/:id
 * Delete a vendor
 * Protected route - admin only
 */
router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteVendor)
);

module.exports = router;
