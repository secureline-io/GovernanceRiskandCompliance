/**
 * Policies Controller
 * CRUD operations for compliance policies
 */

const { Policy, User } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all policies with pagination, filtering, and search
 * GET /api/v1/policies?page=1&limit=20&status=PUBLISHED&assignee=id
 */
const getAll = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      assignee,
      department,
      framework,
      search,
      sort = '-createdAt',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (department) filter.department = department;
    if (framework) filter.framework = framework;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { policyCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Policy.countDocuments(filter);
    const policies = await Policy.find(filter)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: policies,
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
 * Get single policy by ID
 * GET /api/v1/policies/:id
 */
const getById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!policy) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Policy not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new policy
 * POST /api/v1/policies
 */
const create = async (req, res) => {
  try {
    const {
      name,
      policyCode,
      description,
      status,
      version,
      department,
      assignee,
      framework,
      entities,
      content,
      fileUrl,
    } = req.body;

    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Policy name is required',
      });
    }

    const policy = await Policy.create({
      name,
      policyCode,
      description,
      status: status || CONSTANTS.POLICY_STATUS.NOT_UPLOADED,
      version: version || '1.0',
      department,
      assignee,
      framework,
      entities,
      content,
      fileUrl,
      createdBy: req.user._id,
    });

    await policy.populate('assignee', 'name email');
    await policy.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Policy created successfully',
      data: policy,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Policy code already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update policy
 * PUT /api/v1/policies/:id
 */
const update = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      version,
      department,
      assignee,
      framework,
      entities,
      content,
      fileUrl,
    } = req.body;

    let policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Policy not found',
      });
    }

    if (name) policy.name = name;
    if (description !== undefined) policy.description = description;
    if (status) policy.status = status;
    if (version) policy.version = version;
    if (department) policy.department = department;
    if (assignee !== undefined) policy.assignee = assignee;
    if (framework !== undefined) policy.framework = framework;
    if (entities) policy.entities = entities;
    if (content !== undefined) policy.content = content;
    if (fileUrl !== undefined) policy.fileUrl = fileUrl;

    policy.updatedBy = req.user._id;

    policy = await policy.save();
    await policy.populate('assignee', 'name email');
    await policy.populate('updatedBy', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Policy updated successfully',
      data: policy,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete policy
 * DELETE /api/v1/policies/:id
 */
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);

    if (!policy) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Policy not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get policies dashboard statistics
 * GET /api/v1/policies/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Count by status
    const statusStats = await Policy.aggregate([
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

    // Policies by assignee (for chart)
    const assigneeStats = await Policy.aggregate([
      {
        $match: { assignee: { $ne: null } },
      },
      {
        $group: {
          _id: '$assignee',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          assigneeName: '$user.name',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const totalCount = Object.values(statusByCount).reduce((a, b) => a + b, 0);
    const publishedCount =
      statusByCount[CONSTANTS.POLICY_STATUS.PUBLISHED] || 0;
    const publishedPercent =
      totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        total: totalCount,
        publishedPercent,
        byStatus: statusByCount,
        byAssignee: assigneeStats,
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
  deletePolicy,
  getDashboardStats,
};
