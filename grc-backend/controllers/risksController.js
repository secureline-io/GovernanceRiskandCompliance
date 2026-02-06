/**
 * Risks Controller
 * CRUD operations for risk management
 */

const { Risk } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all risks with pagination, filtering, and search
 * GET /api/v1/risks?page=1&limit=20&status=OPEN&likelihood=HIGH&impact=MEDIUM
 */
const getAll = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      category,
      likelihood,
      impact,
      assignee,
      search,
      sort = '-riskScore',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (likelihood) filter.likelihood = likelihood;
    if (impact) filter.impact = impact;
    if (assignee) filter.assignee = assignee;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { riskCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Risk.countDocuments(filter);
    const risks = await Risk.find(filter)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: risks,
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
 * Get single risk by ID
 * GET /api/v1/risks/:id
 */
const getById = async (req, res) => {
  try {
    const risk = await Risk.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('controlRefs', 'name controlCode');

    if (!risk) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Risk not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: risk,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new risk
 * POST /api/v1/risks
 */
const create = async (req, res) => {
  try {
    const {
      name,
      riskCode,
      description,
      status,
      category,
      likelihood,
      impact,
      treatmentStrategy,
      assignee,
      department,
      entities,
      mitigationPlan,
      controlRefs,
    } = req.body;

    if (!name || !likelihood || !impact) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Name, likelihood, and impact are required',
      });
    }

    const risk = await Risk.create({
      name,
      riskCode,
      description,
      status: status || CONSTANTS.RISK_STATUS.OPEN,
      category,
      likelihood,
      impact,
      treatmentStrategy,
      assignee,
      department,
      entities,
      mitigationPlan,
      controlRefs: controlRefs || [],
      createdBy: req.user._id,
    });

    await risk.populate('assignee', 'name email');
    await risk.populate('createdBy', 'name email');
    await risk.populate('controlRefs', 'name controlCode');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Risk created successfully',
      data: risk,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Risk code already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update risk
 * PUT /api/v1/risks/:id
 */
const update = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      category,
      likelihood,
      impact,
      treatmentStrategy,
      assignee,
      department,
      entities,
      mitigationPlan,
      residualRisk,
      controlRefs,
      reviewDate,
    } = req.body;

    let risk = await Risk.findById(req.params.id);

    if (!risk) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Risk not found',
      });
    }

    if (name) risk.name = name;
    if (description !== undefined) risk.description = description;
    if (status) risk.status = status;
    if (category) risk.category = category;
    if (likelihood) risk.likelihood = likelihood;
    if (impact) risk.impact = impact;
    if (treatmentStrategy !== undefined) risk.treatmentStrategy = treatmentStrategy;
    if (assignee !== undefined) risk.assignee = assignee;
    if (department) risk.department = department;
    if (entities) risk.entities = entities;
    if (mitigationPlan !== undefined) risk.mitigationPlan = mitigationPlan;
    if (residualRisk !== undefined) risk.residualRisk = residualRisk;
    if (controlRefs) risk.controlRefs = controlRefs;
    if (reviewDate !== undefined) risk.reviewDate = reviewDate;

    risk.updatedBy = req.user._id;

    risk = await risk.save();
    await risk.populate('assignee', 'name email');
    await risk.populate('updatedBy', 'name email');
    await risk.populate('controlRefs', 'name controlCode');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Risk updated successfully',
      data: risk,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete risk
 * DELETE /api/v1/risks/:id
 */
const deleteRisk = async (req, res) => {
  try {
    const risk = await Risk.findByIdAndDelete(req.params.id);

    if (!risk) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Risk not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Risk deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get risks dashboard statistics
 * GET /api/v1/risks/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Count by status
    const statusStats = await Risk.aggregate([
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

    // Risk heat map (likelihood x impact)
    const heatMapStats = await Risk.aggregate([
      {
        $group: {
          _id: {
            likelihood: '$likelihood',
            impact: '$impact',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const heatMap = {};
    heatMapStats.forEach((stat) => {
      const key = `${stat._id.likelihood}_${stat._id.impact}`;
      heatMap[key] = stat.count;
    });

    // Risk trend over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendStats = await Risk.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    const trend = trendStats.map((item) => ({
      date: item._id.date,
      count: item.count,
    }));

    const totalCount = Object.values(statusByCount).reduce((a, b) => a + b, 0);
    const openCount = statusByCount[CONSTANTS.RISK_STATUS.OPEN] || 0;
    const treatedCount = statusByCount[CONSTANTS.RISK_STATUS.TREATED] || 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        total: totalCount,
        open: openCount,
        treated: treatedCount,
        byStatus: statusByCount,
        heatMap,
        trend,
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
  deleteRisk,
  getDashboardStats,
};
