/**
 * Evidences Controller
 * CRUD operations for compliance evidence
 */

const { Evidence } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all evidences with pagination, filtering, and search
 * GET /api/v1/evidences?page=1&limit=20&status=UPLOADED
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
        { evidenceCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Evidence.countDocuments(filter);
    const evidences = await Evidence.find(filter)
      .populate('assignee', 'name email')
      .populate('controlRef', 'name controlCode')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: evidences,
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
 * Get single evidence by ID
 * GET /api/v1/evidences/:id
 */
const getById = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('controlRef', 'name controlCode')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!evidence) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Evidence not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new evidence
 * POST /api/v1/evidences
 */
const create = async (req, res) => {
  try {
    const {
      name,
      evidenceCode,
      description,
      status,
      assignee,
      department,
      framework,
      entities,
      fileUrl,
      controlRef,
    } = req.body;

    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Evidence name is required',
      });
    }

    const evidence = await Evidence.create({
      name,
      evidenceCode,
      description,
      status: status || CONSTANTS.EVIDENCE_STATUS.NOT_UPLOADED,
      assignee,
      department,
      framework,
      entities,
      fileUrl,
      controlRef,
      createdBy: req.user._id,
    });

    await evidence.populate('assignee', 'name email');
    await evidence.populate('controlRef', 'name controlCode');
    await evidence.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Evidence created successfully',
      data: evidence,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Evidence code already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update evidence
 * PUT /api/v1/evidences/:id
 */
const update = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      assignee,
      department,
      framework,
      entities,
      fileUrl,
      controlRef,
    } = req.body;

    let evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Evidence not found',
      });
    }

    if (name) evidence.name = name;
    if (description !== undefined) evidence.description = description;
    if (status) evidence.status = status;
    if (assignee !== undefined) evidence.assignee = assignee;
    if (department) evidence.department = department;
    if (framework !== undefined) evidence.framework = framework;
    if (entities) evidence.entities = entities;
    if (fileUrl !== undefined) evidence.fileUrl = fileUrl;
    if (controlRef !== undefined) evidence.controlRef = controlRef;

    evidence.updatedBy = req.user._id;

    evidence = await evidence.save();
    await evidence.populate('assignee', 'name email');
    await evidence.populate('controlRef', 'name controlCode');
    await evidence.populate('updatedBy', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Evidence updated successfully',
      data: evidence,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete evidence
 * DELETE /api/v1/evidences/:id
 */
const deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findByIdAndDelete(req.params.id);

    if (!evidence) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Evidence not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Evidence deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get evidences dashboard statistics
 * GET /api/v1/evidences/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Count by status
    const statusStats = await Evidence.aggregate([
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

    // Evidences by assignee (for chart)
    const assigneeStats = await Evidence.aggregate([
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
    const uploadedCount =
      statusByCount[CONSTANTS.EVIDENCE_STATUS.UPLOADED] || 0;
    const uploadedPercent =
      totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        total: totalCount,
        uploadedPercent,
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
  deleteEvidence,
  getDashboardStats,
};
