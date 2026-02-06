/**
 * Tests Controller
 * CRUD operations for compliance tests
 */

const { Test } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all tests with pagination, filtering, and search
 * GET /api/v1/tests?page=1&limit=20&status=OK&type=AUTOMATED_TEST
 */
const getAll = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      type,
      framework,
      assignee,
      search,
      sort = '-createdAt',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (framework) filter.framework = framework;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { testCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Test.countDocuments(filter);
    const tests = await Test.find(filter)
      .populate('assignees', 'name email')
      .populate('controlRef', 'name controlCode')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: tests,
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
 * Get single test by ID
 * GET /api/v1/tests/:id
 */
const getById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('assignees', 'name email')
      .populate('controlRef', 'name controlCode')
      .populate('createdBy', 'name email');

    if (!test) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: test,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new test
 * POST /api/v1/tests
 */
const create = async (req, res) => {
  try {
    const {
      name,
      testCode,
      description,
      type,
      status,
      effortEstimate,
      application,
      assignees,
      framework,
      controlRef,
    } = req.body;

    if (!name || !type) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Test name and type are required',
      });
    }

    const test = await Test.create({
      name,
      testCode,
      description,
      type,
      status: status || CONSTANTS.TEST_STATUS.NEEDS_ATTENTION,
      effortEstimate: effortEstimate || CONSTANTS.EFFORT_ESTIMATE.MEDIUM,
      application: application || 'Scrut',
      assignees: assignees || [],
      framework,
      controlRef,
      createdBy: req.user._id,
    });

    await test.populate('assignees', 'name email');
    await test.populate('controlRef', 'name controlCode');
    await test.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Test created successfully',
      data: test,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Test code already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update test
 * PUT /api/v1/tests/:id
 */
const update = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      type,
      effortEstimate,
      application,
      assignees,
      framework,
      controlRef,
      result,
      lastRunDate,
      nextRunDate,
    } = req.body;

    let test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Test not found',
      });
    }

    if (name) test.name = name;
    if (description !== undefined) test.description = description;
    if (status) test.status = status;
    if (type) test.type = type;
    if (effortEstimate) test.effortEstimate = effortEstimate;
    if (application) test.application = application;
    if (assignees) test.assignees = assignees;
    if (framework !== undefined) test.framework = framework;
    if (controlRef !== undefined) test.controlRef = controlRef;
    if (result !== undefined) test.result = result;
    if (lastRunDate !== undefined) test.lastRunDate = lastRunDate;
    if (nextRunDate !== undefined) test.nextRunDate = nextRunDate;

    test = await test.save();
    await test.populate('assignees', 'name email');
    await test.populate('controlRef', 'name controlCode');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Test updated successfully',
      data: test,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete test
 * DELETE /api/v1/tests/:id
 */
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);

    if (!test) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get tests dashboard statistics
 * GET /api/v1/tests/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Count by status
    const statusStats = await Test.aggregate([
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

    // Count by type
    const typeStats = await Test.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const typeByCount = {};
    typeStats.forEach((stat) => {
      typeByCount[stat._id] = stat.count;
    });

    const totalCount = Object.values(statusByCount).reduce((a, b) => a + b, 0);
    const okCount = statusByCount[CONSTANTS.TEST_STATUS.OK] || 0;
    const passPercent =
      totalCount > 0 ? Math.round((okCount / totalCount) * 100) : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        total: totalCount,
        passPercent,
        byStatus: statusByCount,
        byType: typeByCount,
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
  deleteTest,
  getDashboardStats,
};
