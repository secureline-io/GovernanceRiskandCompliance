/**
 * Controls Controller
 * CRUD operations for compliance controls
 */

const { Control } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all controls with pagination, filtering, and search
 * GET /api/v1/controls?page=1&limit=20&status=COMPLIANT&framework=GDPR&search=keyword
 */
const getAll = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      framework,
      assignee,
      functionGrouping,
      domain,
      search,
      sort = '-createdAt',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (framework) filter.framework = framework;
    if (assignee) filter.assignee = assignee;
    if (functionGrouping) filter.functionGrouping = functionGrouping;
    if (domain) filter.controlDomain = domain;

    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { controlCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Query
    const total = await Control.countDocuments(filter);
    const controls = await Control.find(filter)
      .populate('assignee', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: controls,
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
 * Get single control by ID
 * GET /api/v1/controls/:id
 */
const getById = async (req, res) => {
  try {
    const control = await Control.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!control) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Control not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: control,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new control
 * POST /api/v1/controls
 */
const create = async (req, res) => {
  try {
    const { name, controlCode, description, status, framework, functionGrouping, assignee, domain, entities, scope } = req.body;

    if (!name || !controlCode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Name and control code are required',
      });
    }

    const control = await Control.create({
      name,
      controlCode,
      description,
      status: status || CONSTANTS.CONTROL_STATUS.COMPLIANT,
      framework,
      functionGrouping,
      assignee,
      controlDomain: domain,
      entities,
      controlScope: scope,
      createdBy: req.user._id,
    });

    await control.populate('assignee', 'name email');
    await control.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Control created successfully',
      data: control,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Control code already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update control
 * PUT /api/v1/controls/:id
 */
const update = async (req, res) => {
  try {
    const { name, description, status, framework, functionGrouping, assignee, domain, entities, scope } = req.body;

    let control = await Control.findById(req.params.id);

    if (!control) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Control not found',
      });
    }

    // Update fields
    if (name) control.name = name;
    if (description !== undefined) control.description = description;
    if (status) control.status = status;
    if (framework !== undefined) control.framework = framework;
    if (functionGrouping !== undefined) control.functionGrouping = functionGrouping;
    if (assignee !== undefined) control.assignee = assignee;
    if (domain) control.controlDomain = domain;
    if (entities) control.entities = entities;
    if (scope) control.controlScope = scope;

    control.updatedBy = req.user._id;

    control = await control.save();
    await control.populate('assignee', 'name email');
    await control.populate('updatedBy', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Control updated successfully',
      data: control,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete control
 * DELETE /api/v1/controls/:id
 */
const deleteControl = async (req, res) => {
  try {
    const control = await Control.findByIdAndDelete(req.params.id);

    if (!control) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Control not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Control deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get controls dashboard statistics
 * GET /api/v1/controls/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Count by status
    const statusStats = await Control.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusByCount = {};
    statusStats.forEach((stat) => {
      statusByCount[stat._id] = stat.count;
    });

    // Count by function grouping
    const functionGroupingStats = await Control.aggregate([
      {
        $match: { functionGrouping: { $ne: null } },
      },
      {
        $group: {
          _id: '$functionGrouping',
          count: { $sum: 1 },
        },
      },
    ]);

    const functionGroupingByCount = {};
    functionGroupingStats.forEach((stat) => {
      functionGroupingByCount[stat._id] = stat.count;
    });

    // Count by framework
    const frameworkStats = await Control.aggregate([
      {
        $match: { framework: { $ne: null } },
      },
      {
        $group: {
          _id: '$framework',
          count: { $sum: 1 },
        },
      },
    ]);

    const frameworkByCount = {};
    frameworkStats.forEach((stat) => {
      frameworkByCount[stat._id] = stat.count;
    });

    // Get counts
    const compliantCount =
      statusByCount[CONSTANTS.CONTROL_STATUS.COMPLIANT] || 0;
    const nonCompliantCount =
      statusByCount[CONSTANTS.CONTROL_STATUS.NON_COMPLIANT] || 0;
    const notApplicableCount =
      statusByCount[CONSTANTS.CONTROL_STATUS.NOT_APPLICABLE] || 0;
    const totalCount =
      compliantCount + nonCompliantCount + notApplicableCount;

    const compliancePercent =
      totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        total: totalCount,
        compliancePercent,
        byStatus: statusByCount,
        byFunctionGrouping: functionGroupingByCount,
        byFramework: frameworkByCount,
        counts: {
          compliant: compliantCount,
          nonCompliant: nonCompliantCount,
          notApplicable: notApplicableCount,
        },
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
  getAll,
  getById,
  create,
  update,
  deleteControl,
  getDashboardStats,
};
