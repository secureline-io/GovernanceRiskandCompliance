/**
 * Dashboard Routes
 * GET /api/v1/dashboard/stats
 * GET /api/v1/dashboard/compliance-trend
 * GET /api/v1/dashboard/cloud-security
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const {
  getDashboardStats,
  getComplianceTrend,
  getCloudSecurityOverview,
} = require('../controllers/dashboardController');

/**
 * GET /api/v1/dashboard/stats
 * Get overall dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/stats', protect, asyncHandler(getDashboardStats));

/**
 * GET /api/v1/dashboard/compliance-trend
 * Get compliance trend over last 30 days
 * Protected route - all authenticated users can access
 */
router.get('/compliance-trend', protect, asyncHandler(getComplianceTrend));

/**
 * GET /api/v1/dashboard/cloud-security
 * Get cloud security overview (mock data)
 * Protected route - all authenticated users can access
 */
router.get('/cloud-security', protect, asyncHandler(getCloudSecurityOverview));

module.exports = router;
