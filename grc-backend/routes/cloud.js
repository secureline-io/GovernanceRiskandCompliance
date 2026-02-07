/**
 * Cloud Integration Routes
 * Cloud integrations, asset inventory, and classification rules management
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const {
  listIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testConnection,
  triggerSync,
  getSyncHistory,
  getSyncJob,
  getIntegrationStats,
  listAssets,
  getAsset,
  updateAssetClassification,
  bulkUpdateClassification,
  getAssetRelationships,
  exportAssets,
  getAssetStats,
  listRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRule,
  runClassification,
  previewRule,
} = require('../controllers/cloudController');

/**
 * Cloud Integration Routes
 */

/**
 * GET /api/v1/cloud/integrations
 * List all cloud integrations with stats
 * Protected route - all authenticated users can access
 */
router.get('/integrations', protect, asyncHandler(listIntegrations));

/**
 * GET /api/v1/cloud/integrations/:id
 * Get single integration with sync history
 * Protected route - all authenticated users can access
 */
router.get('/integrations/:id', protect, asyncHandler(getIntegration));

/**
 * POST /api/v1/cloud/integrations
 * Create new cloud integration (Add AWS Account)
 * Protected route - admin and manager only
 */
router.post(
  '/integrations',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(createIntegration)
);

/**
 * PUT /api/v1/cloud/integrations/:id
 * Update integration settings
 * Protected route - admin and manager only
 */
router.put(
  '/integrations/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(updateIntegration)
);

/**
 * DELETE /api/v1/cloud/integrations/:id
 * Delete integration
 * Protected route - admin only
 */
router.delete(
  '/integrations/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteIntegration)
);

/**
 * POST /api/v1/cloud/integrations/:id/test
 * Test connection for integration
 * Protected route - admin and manager only
 */
router.post(
  '/integrations/:id/test',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(testConnection)
);

/**
 * POST /api/v1/cloud/integrations/:id/sync
 * Trigger manual sync for integration
 * Protected route - admin and manager only
 */
router.post(
  '/integrations/:id/sync',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(triggerSync)
);

/**
 * GET /api/v1/cloud/integrations/:id/sync-history
 * Get sync job history for integration
 * Protected route - all authenticated users can access
 */
router.get(
  '/integrations/:id/sync-history',
  protect,
  asyncHandler(getSyncHistory)
);

/**
 * GET /api/v1/cloud/integrations/:id/stats
 * Get aggregated stats for integration
 * Protected route - all authenticated users can access
 */
router.get(
  '/integrations/:id/stats',
  protect,
  asyncHandler(getIntegrationStats)
);

/**
 * GET /api/v1/cloud/sync-jobs/:id
 * Get details of specific sync job
 * Protected route - all authenticated users can access
 */
router.get('/sync-jobs/:id', protect, asyncHandler(getSyncJob));

/**
 * Asset Inventory Routes
 */

/**
 * GET /api/v1/cloud/assets
 * List all assets with filtering, search, and pagination
 * Protected route - all authenticated users can access
 */
router.get('/assets', protect, asyncHandler(listAssets));

/**
 * GET /api/v1/cloud/assets/stats
 * Get asset inventory dashboard statistics
 * Protected route - all authenticated users can access
 */
router.get('/assets/stats', protect, asyncHandler(getAssetStats));

/**
 * GET /api/v1/cloud/assets/export
 * Export assets as CSV
 * Protected route - all authenticated users can access
 */
router.get('/assets/export', protect, asyncHandler(exportAssets));

/**
 * GET /api/v1/cloud/assets/:id
 * Get single asset with full details
 * Protected route - all authenticated users can access
 */
router.get('/assets/:id', protect, asyncHandler(getAsset));

/**
 * PUT /api/v1/cloud/assets/:id/classify
 * Update asset classification
 * Protected route - admin and manager only
 */
router.put(
  '/assets/:id/classify',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(updateAssetClassification)
);

/**
 * POST /api/v1/cloud/assets/bulk-classify
 * Bulk update asset classifications
 * Protected route - admin and manager only
 */
router.post(
  '/assets/bulk-classify',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(bulkUpdateClassification)
);

/**
 * GET /api/v1/cloud/assets/:id/relationships
 * Get asset relationship graph
 * Protected route - all authenticated users can access
 */
router.get(
  '/assets/:id/relationships',
  protect,
  asyncHandler(getAssetRelationships)
);

/**
 * Classification Rule Routes
 */

/**
 * GET /api/v1/cloud/rules
 * List all classification rules
 * Protected route - all authenticated users can access
 */
router.get('/rules', protect, asyncHandler(listRules));

/**
 * POST /api/v1/cloud/rules
 * Create new classification rule
 * Protected route - admin and manager only
 */
router.post(
  '/rules',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(createRule)
);

/**
 * PUT /api/v1/cloud/rules/:id
 * Update classification rule
 * Protected route - admin and manager only
 */
router.put(
  '/rules/:id',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(updateRule)
);

/**
 * DELETE /api/v1/cloud/rules/:id
 * Delete classification rule
 * Protected route - admin only
 */
router.delete(
  '/rules/:id',
  protect,
  authorize('ADMIN'),
  asyncHandler(deleteRule)
);

/**
 * PATCH /api/v1/cloud/rules/:id/toggle
 * Toggle rule enabled/disabled status
 * Protected route - admin and manager only
 */
router.patch(
  '/rules/:id/toggle',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(toggleRule)
);

/**
 * POST /api/v1/cloud/rules/run
 * Run classification rules against assets
 * Protected route - admin and manager only
 */
router.post(
  '/rules/run',
  protect,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(runClassification)
);

/**
 * POST /api/v1/cloud/rules/:id/preview
 * Preview which assets a rule would match
 * Protected route - all authenticated users can access
 */
router.post(
  '/rules/:id/preview',
  protect,
  asyncHandler(previewRule)
);

module.exports = router;
