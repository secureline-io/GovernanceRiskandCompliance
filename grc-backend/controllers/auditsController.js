/**
 * Audits Controller
 * CRUD operations for audits and audit findings
 */

const { Audit } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all audits with pagination, filtering, and search
 * GET /api/v1/audits?page=1&limit=20&status=IN_PROGRESS&auditType=INTERNAL
 */
const getAll = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      auditType,
      framework,
      search,
      sort = '-auditDate',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status) filter.status = status;
    if (auditType) filter.auditType = auditType;
    if (framework) filter.framework = framework;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { auditCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Audit.countDocuments(filter);
    const audits = await Audit.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: audits,
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
 * Get single audit by ID
 * GET /api/v1/audits/:id
 */
const getById = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!audit) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Audit not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: audit,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new audit
 * POST /api/v1/audits
 */
const create = async (req, res) => {
  try {
    const {
      name,
      auditCode,
      description,
      auditType,
      auditDate,
      entities,
      auditorName,
      auditorFirm,
      framework,
    } = req.body;

    if (!name || !auditType || !auditDate) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Name, audit type, and audit date are required',
      });
    }

    const audit = await Audit.create({
      name,
      auditCode,
      description,
      auditType,
      auditDate,
      entities: entities || 'Organization Wide',
      auditorName,
      auditorFirm,
      framework,
      status: CONSTANTS.AUDIT_STATUS.UPCOMING,
      createdBy: req.user._id,
    });

    await audit.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Audit created successfully',
      data: audit,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Audit code already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update audit
 * PUT /api/v1/audits/:id
 */
const update = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      auditDate,
      entities,
      auditorName,
      auditorFirm,
      observationPeriodStart,
      observationPeriodEnd,
    } = req.body;

    let audit = await Audit.findById(req.params.id);

    if (!audit) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Audit not found',
      });
    }

    if (name) audit.name = name;
    if (description !== undefined) audit.description = description;
    if (status) audit.status = status;
    if (auditDate) audit.auditDate = auditDate;
    if (entities) audit.entities = entities;
    if (auditorName) audit.auditorName = auditorName;
    if (auditorFirm) audit.auditorFirm = auditorFirm;
    if (observationPeriodStart) audit.observationPeriodStart = observationPeriodStart;
    if (observationPeriodEnd) audit.observationPeriodEnd = observationPeriodEnd;

    audit.updatedBy = req.user._id;

    audit = await audit.save();
    await audit.populate('updatedBy', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Audit updated successfully',
      data: audit,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete audit
 * DELETE /api/v1/audits/:id
 */
const deleteAudit = async (req, res) => {
  try {
    const audit = await Audit.findByIdAndDelete(req.params.id);

    if (!audit) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Audit not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Audit deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add finding to audit
 * POST /api/v1/audits/:id/findings
 */
const addFinding = async (req, res) => {
  try {
    const { title, description, severity } = req.body;

    if (!title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Finding title is required',
      });
    }

    const audit = await Audit.findById(req.params.id);

    if (!audit) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Audit not found',
      });
    }

    audit.findings.push({
      title,
      description: description || null,
      severity: severity || 'medium',
      status: 'open',
    });

    audit.updatedBy = req.user._id;
    await audit.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Finding added successfully',
      data: audit,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add request to audit
 * POST /api/v1/audits/:id/requests
 */
const addRequest = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Request title is required',
      });
    }

    const audit = await Audit.findById(req.params.id);

    if (!audit) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Audit not found',
      });
    }

    audit.requests.push({
      title,
      description: description || null,
      dueDate: dueDate || null,
      status: 'pending',
    });

    audit.updatedBy = req.user._id;
    await audit.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Request added successfully',
      data: audit,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add corrective action to audit
 * POST /api/v1/audits/:id/corrective-actions
 */
const addCorrectiveAction = async (req, res) => {
  try {
    const { title, description, assignee, dueDate } = req.body;

    if (!title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Action title is required',
      });
    }

    const audit = await Audit.findById(req.params.id);

    if (!audit) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Audit not found',
      });
    }

    audit.correctiveActions.push({
      title,
      description: description || null,
      assignee: assignee || null,
      dueDate: dueDate || null,
      status: 'open',
    });

    audit.updatedBy = req.user._id;
    await audit.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Corrective action added successfully',
      data: audit,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get audits dashboard statistics
 * GET /api/v1/audits/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Count by status
    const statusStats = await Audit.aggregate([
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

    // Count by audit type
    const typeStats = await Audit.aggregate([
      {
        $group: {
          _id: '$auditType',
          count: { $sum: 1 },
        },
      },
    ]);

    const typeByCount = {};
    typeStats.forEach((stat) => {
      typeByCount[stat._id] = stat.count;
    });

    // Get recent audits
    const recentAudits = await Audit.find()
      .sort({ auditDate: -1 })
      .limit(5)
      .select('name status auditType auditDate');

    const totalCount = Object.values(statusByCount).reduce((a, b) => a + b, 0);
    const completedCount =
      statusByCount[CONSTANTS.AUDIT_STATUS.COMPLETED] || 0;
    const completedPercent =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        total: totalCount,
        completedPercent,
        byStatus: statusByCount,
        byType: typeByCount,
        recent: recentAudits,
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
  deleteAudit,
  addFinding,
  addRequest,
  addCorrectiveAction,
  getDashboardStats,
};
