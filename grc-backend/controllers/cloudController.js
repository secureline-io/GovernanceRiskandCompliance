/**
 * Cloud Integration Controller
 * Cloud integrations, asset inventory, and classification rules management
 */

const { CloudIntegration, Asset, ClassificationRule, SyncJob } = require('../models');
const { awsDiscovery, classificationEngine, syncScheduler } = require('../services');
const { HTTP_STATUS, PAGINATION } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');
const csv = require('csv-stringify/sync');

/**
 * Cloud Integrations - List all integrations with stats
 * GET /api/v1/cloud/integrations
 */
const listIntegrations = async (req, res) => {
  try {
    const integrations = await CloudIntegration.find()
      .select('-credentials -externalId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort('-createdAt');

    // Get stats for each integration
    const integrationsWithStats = await Promise.all(
      integrations.map(async (integration) => {
        const assetCount = await Asset.countDocuments({ integrationId: integration._id });
        const lastSync = await SyncJob.findOne({ integrationId: integration._id })
          .sort('-createdAt')
          .select('startTime endTime status');

        return {
          ...integration.toObject(),
          stats: {
            totalAssets: assetCount,
            lastSync: lastSync || null,
          },
        };
      })
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: integrationsWithStats,
      pagination: {
        total: integrationsWithStats.length,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Get single integration with sync history
 * GET /api/v1/cloud/integrations/:id
 */
const getIntegration = async (req, res) => {
  try {
    const integration = await CloudIntegration.findById(req.params.id)
      .select('-credentials -externalId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!integration) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Integration not found',
      });
    }

    // Get recent sync history
    const syncHistory = await SyncJob.find({ integrationId: integration._id })
      .sort('-createdAt')
      .limit(10)
      .select('startTime endTime status assetsDiscovered assetsSynced');

    // Get asset count by service
    const assetsByService = await Asset.aggregate([
      { $match: { integrationId: integration._id } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        ...integration.toObject(),
        syncHistory,
        assetsByService,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Create new integration (Add AWS Account)
 * POST /api/v1/cloud/integrations
 * Body: { name, provider, roleArn, regions, enabledServices, syncSchedule }
 */
const createIntegration = async (req, res) => {
  try {
    const { name, provider, roleArn, regions, enabledServices, syncSchedule } = req.body;

    // Validate required fields
    if (!name || !provider || !roleArn) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Name, provider, and roleArn are required',
      });
    }

    // Validate roleArn format for AWS
    const roleArnRegex = /^arn:aws:iam::\d{12}:role\/.+$/;
    if (provider === 'AWS' && !roleArnRegex.test(roleArn)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid AWS role ARN format. Expected: arn:aws:iam::123456789012:role/RoleName',
      });
    }

    // Generate external ID for trust relationship
    const externalId = uuidv4();

    // Create integration with pending status
    const integration = await CloudIntegration.create({
      name,
      provider,
      roleArn,
      externalId,
      regions: regions || ['us-east-1'],
      enabledServices: enabledServices || ['EC2', 'RDS', 'S3'],
      syncSchedule: syncSchedule || 'daily',
      status: 'pending',
      connectionDetails: {
        status: 'pending',
        lastAttempt: new Date(),
      },
      createdBy: req.user._id,
    });

    // Test connection with AWS
    try {
      const connectionTest = await awsDiscovery.testConnection({
        roleArn,
        externalId,
        accountId: roleArn.split(':')[4],
      });

      if (connectionTest.success) {
        // Update integration to connected
        integration.status = 'connected';
        integration.connectionDetails = {
          status: 'connected',
          lastAttempt: new Date(),
          accountId: connectionTest.accountId,
        };

        await integration.save();

        // Trigger initial sync
        await syncScheduler.triggerSync(integration._id, req.user._id);
      } else {
        // Mark as failed with error
        integration.status = 'failed';
        integration.connectionDetails = {
          status: 'failed',
          lastAttempt: new Date(),
          error: connectionTest.error || 'Connection test failed',
        };

        await integration.save();
      }
    } catch (connectionError) {
      // Connection test error
      integration.status = 'failed';
      integration.connectionDetails = {
        status: 'failed',
        lastAttempt: new Date(),
        error: connectionError.message,
      };

      await integration.save();
    }

    await integration.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Integration created successfully',
      data: integration,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Update integration
 * PUT /api/v1/cloud/integrations/:id
 * Body: { regions, enabledServices, syncSchedule, name }
 */
const updateIntegration = async (req, res) => {
  try {
    const { name, regions, enabledServices, syncSchedule } = req.body;

    let integration = await CloudIntegration.findById(req.params.id);

    if (!integration) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Integration not found',
      });
    }

    if (name) integration.name = name;
    if (regions) integration.regions = regions;
    if (enabledServices) integration.enabledServices = enabledServices;
    if (syncSchedule) integration.syncSchedule = syncSchedule;

    integration.updatedBy = req.user._id;

    integration = await integration.save();
    await integration.populate('updatedBy', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Integration updated successfully',
      data: integration,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Delete integration
 * DELETE /api/v1/cloud/integrations/:id
 * Query: ?deleteAssets=true (optional, delete associated assets)
 */
const deleteIntegration = async (req, res) => {
  try {
    const { deleteAssets } = req.query;

    const integration = await CloudIntegration.findByIdAndDelete(req.params.id);

    if (!integration) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Integration not found',
      });
    }

    // Optionally delete associated assets
    if (deleteAssets === 'true') {
      await Asset.deleteMany({ integrationId: integration._id });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Integration deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Test connection for existing integration
 * POST /api/v1/cloud/integrations/:id/test
 */
const testConnection = async (req, res) => {
  try {
    const integration = await CloudIntegration.findById(req.params.id);

    if (!integration) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Integration not found',
      });
    }

    // Test connection with AWS
    const connectionTest = await awsDiscovery.testConnection({
      roleArn: integration.roleArn,
      externalId: integration.externalId,
      accountId: integration.roleArn.split(':')[4],
    });

    integration.connectionDetails = {
      status: connectionTest.success ? 'connected' : 'failed',
      lastAttempt: new Date(),
      error: !connectionTest.success ? connectionTest.error : null,
    };

    if (connectionTest.success) {
      integration.status = 'connected';
    } else {
      integration.status = 'failed';
    }

    await integration.save();

    res.status(HTTP_STATUS.OK).json({
      success: connectionTest.success,
      message: connectionTest.success ? 'Connection successful' : 'Connection failed',
      data: {
        status: integration.connectionDetails.status,
        error: integration.connectionDetails.error,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Manually trigger sync
 * POST /api/v1/cloud/integrations/:id/sync
 */
const triggerSync = async (req, res) => {
  try {
    const integration = await CloudIntegration.findById(req.params.id);

    if (!integration) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Integration not found',
      });
    }

    if (integration.status !== 'connected') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Integration is not connected',
      });
    }

    // Trigger sync via scheduler
    const syncJob = await syncScheduler.triggerSync(integration._id, req.user._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sync triggered successfully',
      data: syncJob,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Get sync history for integration
 * GET /api/v1/cloud/integrations/:id/sync-history?page=1&limit=20
 */
const getSyncHistory = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const integration = await CloudIntegration.findById(req.params.id);

    if (!integration) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Integration not found',
      });
    }

    const total = await SyncJob.countDocuments({ integrationId: integration._id });
    const syncJobs = await SyncJob.find({ integrationId: integration._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .select('startTime endTime status assetsDiscovered assetsSynced error');

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: syncJobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Get details of specific sync job
 * GET /api/v1/cloud/sync-jobs/:id
 */
const getSyncJob = async (req, res) => {
  try {
    const syncJob = await SyncJob.findById(req.params.id)
      .populate('integrationId', 'name provider')
      .populate('triggeredBy', 'name email');

    if (!syncJob) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Sync job not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: syncJob,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cloud Integrations - Get integration stats
 * GET /api/v1/cloud/integrations/:id/stats
 */
const getIntegrationStats = async (req, res) => {
  try {
    const integration = await CloudIntegration.findById(req.params.id);

    if (!integration) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Integration not found',
      });
    }

    // Total assets
    const totalAssets = await Asset.countDocuments({ integrationId: integration._id });

    // Assets by service
    const assetsByService = await Asset.aggregate([
      { $match: { integrationId: integration._id } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Assets by region
    const assetsByRegion = await Asset.aggregate([
      { $match: { integrationId: integration._id } },
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Last sync info
    const lastSync = await SyncJob.findOne({ integrationId: integration._id })
      .sort('-createdAt')
      .select('startTime endTime status assetsDiscovered assetsSynced');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalAssets,
        assetsByService,
        assetsByRegion,
        lastSync,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Asset Inventory - List all assets with filtering, search, and pagination
 * GET /api/v1/cloud/assets?page=1&limit=50&provider=AWS&region=us-east-1&search=keyword
 */
const listAssets = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      provider,
      accountId,
      region,
      service,
      resourceType,
      environment,
      owner,
      criticality,
      dataClassification,
      isInternetExposed,
      lifecycleState,
      complianceStatus,
      search,
      sort = '-lastSeen',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};

    if (provider) filter.provider = provider;
    if (accountId) filter.accountId = accountId;
    if (region) filter.region = region;
    if (service) filter.service = service;
    if (resourceType) filter.resourceType = resourceType;
    if (environment) filter.classification.environment = environment;
    if (owner) filter.classification.owner = owner;
    if (criticality) filter.classification.criticality = criticality;
    if (dataClassification) filter.classification.dataClassification = dataClassification;
    if (isInternetExposed !== undefined) filter.isInternetExposed = isInternetExposed === 'true';
    if (lifecycleState) filter.lifecycleState = lifecycleState;
    if (complianceStatus) filter.complianceStatus = complianceStatus;

    // Text search
    if (search) {
      filter.$or = [
        { resourceName: { $regex: search, $options: 'i' } },
        { resourceArn: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
      ];
    }

    // Get faceted counts for filters
    const facets = await Asset.aggregate([
      { $match: filter },
      {
        $facet: {
          byProvider: [
            { $group: { _id: '$provider', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byService: [
            { $group: { _id: '$service', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byRegion: [
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byEnvironment: [
            { $group: { _id: '$classification.environment', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byCriticality: [
            { $group: { _id: '$classification.criticality', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]);

    // Query assets
    const total = await Asset.countDocuments(filter);
    const assets = await Asset.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: assets,
      facets: facets[0] || {},
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Asset Inventory - Get single asset with full details
 * GET /api/v1/cloud/assets/:id
 */
const getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Asset Inventory - Update asset classification
 * PUT /api/v1/cloud/assets/:id/classify
 * Body: { environment, owner, dataClassification, criticality }
 */
const updateAssetClassification = async (req, res) => {
  try {
    const { environment, owner, dataClassification, criticality } = req.body;

    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Store override
    asset.classificationOverrides = {
      environment: environment || asset.classificationOverrides?.environment,
      owner: owner || asset.classificationOverrides?.owner,
      dataClassification: dataClassification || asset.classificationOverrides?.dataClassification,
      criticality: criticality || asset.classificationOverrides?.criticality,
      overriddenBy: req.user._id,
      overriddenAt: new Date(),
    };

    // Update classification
    if (environment !== undefined) asset.classification.environment = environment;
    if (owner !== undefined) asset.classification.owner = owner;
    if (dataClassification !== undefined) asset.classification.dataClassification = dataClassification;
    if (criticality !== undefined) asset.classification.criticality = criticality;

    // Add to change history
    asset.changeHistory.push({
      changedBy: req.user._id,
      changedAt: new Date(),
      field: 'classification',
      previousValue: {
        environment: asset.classification.environment,
        owner: asset.classification.owner,
        dataClassification: asset.classification.dataClassification,
        criticality: asset.classification.criticality,
      },
      newValue: {
        environment,
        owner,
        dataClassification,
        criticality,
      },
      changeType: 'manual_override',
    });

    asset = await asset.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Asset classification updated successfully',
      data: asset,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Asset Inventory - Bulk update classification
 * POST /api/v1/cloud/assets/bulk-classify
 * Body: { assetIds, filter, environment, owner, dataClassification, criticality }
 */
const bulkUpdateClassification = async (req, res) => {
  try {
    const { assetIds, filter, environment, owner, dataClassification, criticality } = req.body;

    let updateFilter = {};

    // Use provided IDs or build filter
    if (assetIds && assetIds.length > 0) {
      updateFilter = { _id: { $in: assetIds } };
    } else if (filter) {
      updateFilter = filter;
    } else {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Either assetIds or filter is required',
      });
    }

    // Build update object
    const updateObj = {};
    if (environment !== undefined) updateObj['classification.environment'] = environment;
    if (owner !== undefined) updateObj['classification.owner'] = owner;
    if (dataClassification !== undefined) updateObj['classification.dataClassification'] = dataClassification;
    if (criticality !== undefined) updateObj['classification.criticality'] = criticality;

    updateObj['classificationOverrides.overriddenBy'] = req.user._id;
    updateObj['classificationOverrides.overriddenAt'] = new Date();

    const result = await Asset.updateMany(updateFilter, { $set: updateObj });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${result.modifiedCount} assets updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Asset Inventory - Get asset relationships
 * GET /api/v1/cloud/assets/:id/relationships
 */
const getAssetRelationships = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Get relationships
    const relationships = asset.relationships || [];

    // Get related assets (2 levels deep)
    const relatedAssets = await Asset.find({
      _id: { $in: relationships.map((r) => r.targetAssetId) },
    }).select('resourceName resourceId service region');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        asset: {
          _id: asset._id,
          resourceName: asset.resourceName,
          resourceId: asset.resourceId,
        },
        relationships: relationships.map((r) => ({
          ...r,
          targetAsset: relatedAssets.find((a) => a._id.toString() === r.targetAssetId.toString()),
        })),
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Asset Inventory - Export assets as CSV
 * GET /api/v1/cloud/assets/export?columns=resourceName,service,region,classification
 */
const exportAssets = async (req, res) => {
  try {
    const { columns = 'resourceName,service,region,provider' } = req.query;

    const columnList = columns.split(',').filter((c) => c);

    const assets = await Asset.find().lean();

    // Build CSV data
    const csvData = assets.map((asset) => {
      const row = {};
      columnList.forEach((col) => {
        if (col.startsWith('classification.')) {
          row[col] = asset.classification?.[col.split('.')[1]];
        } else {
          row[col] = asset[col];
        }
      });
      return row;
    });

    const output = csv.stringify(csvData, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="assets.csv"');
    res.send(output);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Asset Inventory - Get dashboard statistics
 * GET /api/v1/cloud/assets/stats
 */
const getAssetStats = async (req, res) => {
  try {
    // Total assets
    const totalAssets = await Asset.countDocuments();

    // Assets by provider
    const assetsByProvider = await Asset.aggregate([
      { $group: { _id: '$provider', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Assets by service
    const assetsByService = await Asset.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Assets by region
    const assetsByRegion = await Asset.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Classification coverage
    const classified = await Asset.countDocuments({ 'classification.criticality': { $ne: null } });
    const classificationCoverage = totalAssets > 0 ? Math.round((classified / totalAssets) * 100) : 0;

    // Internet exposed
    const internetExposed = await Asset.countDocuments({ isInternetExposed: true });

    // Stale assets (not seen in 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const staleAssets = await Asset.countDocuments({ lastSeen: { $lt: thirtyDaysAgo } });

    // Assets by environment
    const assetsByEnvironment = await Asset.aggregate([
      { $group: { _id: '$classification.environment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Assets by criticality
    const assetsByCriticality = await Asset.aggregate([
      { $group: { _id: '$classification.criticality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // New assets this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newAssetsThisWeek = await Asset.countDocuments({ createdAt: { $gte: oneWeekAgo } });

    // Timeline of asset discovery (30 days)
    const timeline = await Asset.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalAssets,
        assetsByProvider,
        assetsByService,
        assetsByRegion,
        classificationCoverage: {
          classified,
          unclassified: totalAssets - classified,
          percentage: classificationCoverage,
        },
        internetExposed,
        staleAssets,
        assetsByEnvironment,
        assetsByCriticality,
        newAssetsThisWeek,
        discoveryTimeline: timeline,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classification Rules - List all rules
 * GET /api/v1/cloud/rules
 */
const listRules = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const total = await ClassificationRule.countDocuments();
    const rules = await ClassificationRule.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: rules,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classification Rules - Create new rule
 * POST /api/v1/cloud/rules
 * Body: { name, description, criteria, classification, enabled }
 */
const createRule = async (req, res) => {
  try {
    const { name, description, criteria, classification, enabled } = req.body;

    if (!name || !criteria || !classification) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Name, criteria, and classification are required',
      });
    }

    const rule = await ClassificationRule.create({
      name,
      description,
      criteria,
      classification,
      enabled: enabled !== false,
      createdBy: req.user._id,
    });

    await rule.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Classification rule created successfully',
      data: rule,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classification Rules - Update rule
 * PUT /api/v1/cloud/rules/:id
 */
const updateRule = async (req, res) => {
  try {
    const { name, description, criteria, classification, enabled } = req.body;

    let rule = await ClassificationRule.findById(req.params.id);

    if (!rule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Rule not found',
      });
    }

    if (name) rule.name = name;
    if (description !== undefined) rule.description = description;
    if (criteria) rule.criteria = criteria;
    if (classification) rule.classification = classification;
    if (enabled !== undefined) rule.enabled = enabled;

    rule = await rule.save();
    await rule.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Rule updated successfully',
      data: rule,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classification Rules - Delete rule
 * DELETE /api/v1/cloud/rules/:id
 */
const deleteRule = async (req, res) => {
  try {
    const rule = await ClassificationRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Rule not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Rule deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classification Rules - Toggle rule enabled/disabled
 * PATCH /api/v1/cloud/rules/:id/toggle
 */
const toggleRule = async (req, res) => {
  try {
    let rule = await ClassificationRule.findById(req.params.id);

    if (!rule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Rule not found',
      });
    }

    rule.enabled = !rule.enabled;
    rule = await rule.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Rule ${rule.enabled ? 'enabled' : 'disabled'} successfully`,
      data: rule,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classification Rules - Run classification against assets
 * POST /api/v1/cloud/rules/run
 * Body: { filter, ruleIds (optional) }
 */
const runClassification = async (req, res) => {
  try {
    const { filter, ruleIds } = req.body;

    // Get rules to apply
    let rules = [];
    if (ruleIds && ruleIds.length > 0) {
      rules = await ClassificationRule.find({ _id: { $in: ruleIds }, enabled: true });
    } else {
      rules = await ClassificationRule.find({ enabled: true });
    }

    // Get assets to classify
    const assetFilter = filter || {};
    const assets = await Asset.find(assetFilter);

    // Run classification
    let classified = 0;
    for (const asset of assets) {
      const result = await classificationEngine.classifyAsset(asset, rules);
      if (result) {
        classified++;
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Classification completed. ${classified} assets classified.`,
      data: {
        totalAssets: assets.length,
        classifiedAssets: classified,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Classification Rules - Preview rule matches
 * POST /api/v1/cloud/rules/:id/preview
 * Body: { limit: 10 }
 */
const previewRule = async (req, res) => {
  try {
    const { limit = 10 } = req.body;

    const rule = await ClassificationRule.findById(req.params.id);

    if (!rule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Rule not found',
      });
    }

    // Preview which assets would match this rule
    const matchedAssets = await classificationEngine.previewRuleMatches(rule, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        rule: {
          _id: rule._id,
          name: rule.name,
        },
        matchedCount: matchedAssets.length,
        matchedAssets,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
