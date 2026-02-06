/**
 * Vendors Controller
 * CRUD operations for vendor management
 */

const { Vendor } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all vendors with pagination, filtering, and search
 * GET /api/v1/vendors?page=1&limit=20&status=ASSESSED&category=Cloud
 */
const getAll = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      category,
      assignee,
      search,
      sort = '-createdAt',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignee) filter.assignee = assignee;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { vendorCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Vendor.countDocuments(filter);
    const vendors = await Vendor.find(filter)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: vendors,
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
 * Get single vendor by ID
 * GET /api/v1/vendors/:id
 */
const getById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!vendor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new vendor
 * POST /api/v1/vendors
 */
const create = async (req, res) => {
  try {
    const {
      name,
      vendorCode,
      description,
      status,
      category,
      assignee,
      entities,
      contactName,
      contactEmail,
      website,
      riskLevel,
    } = req.body;

    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Vendor name is required',
      });
    }

    const vendor = await Vendor.create({
      name,
      vendorCode,
      description,
      status: status || CONSTANTS.VENDOR_STATUS.NOT_ASSESSED,
      category,
      assignee,
      entities: entities || 'Organization Wide',
      contactName,
      contactEmail,
      website,
      riskLevel,
      createdBy: req.user._id,
    });

    await vendor.populate('assignee', 'name email');
    await vendor.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Vendor code already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update vendor
 * PUT /api/v1/vendors/:id
 */
const update = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      category,
      assignee,
      entities,
      contactName,
      contactEmail,
      website,
      riskLevel,
      questionnaireStatus,
      assessmentDate,
      nextReassessmentDate,
    } = req.body;

    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    if (name) vendor.name = name;
    if (description !== undefined) vendor.description = description;
    if (status) vendor.status = status;
    if (category) vendor.category = category;
    if (assignee !== undefined) vendor.assignee = assignee;
    if (entities) vendor.entities = entities;
    if (contactName) vendor.contactName = contactName;
    if (contactEmail) vendor.contactEmail = contactEmail;
    if (website !== undefined) vendor.website = website;
    if (riskLevel !== undefined) vendor.riskLevel = riskLevel;
    if (questionnaireStatus) vendor.questionnaireStatus = questionnaireStatus;
    if (assessmentDate !== undefined) vendor.assessmentDate = assessmentDate;
    if (nextReassessmentDate !== undefined)
      vendor.nextReassessmentDate = nextReassessmentDate;

    vendor = await vendor.save();
    await vendor.populate('assignee', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete vendor
 * DELETE /api/v1/vendors/:id
 */
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get vendors dashboard statistics
 * GET /api/v1/vendors/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Count by status
    const statusStats = await Vendor.aggregate([
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

    // Count by questionnaire status
    const questionnaireStats = await Vendor.aggregate([
      {
        $group: {
          _id: '$questionnaireStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const questionnaireByCount = {};
    questionnaireStats.forEach((stat) => {
      questionnaireByCount[stat._id] = stat.count;
    });

    // Count by risk level
    const riskLevelStats = await Vendor.aggregate([
      {
        $match: { riskLevel: { $ne: null } },
      },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    const riskLevelByCount = {};
    riskLevelStats.forEach((stat) => {
      riskLevelByCount[stat._id] = stat.count;
    });

    const totalCount = Object.values(statusByCount).reduce((a, b) => a + b, 0);
    const assessedCount =
      statusByCount[CONSTANTS.VENDOR_STATUS.ASSESSED] || 0;
    const assessedPercent =
      totalCount > 0 ? Math.round((assessedCount / totalCount) * 100) : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        total: totalCount,
        assessedPercent,
        byStatus: statusByCount,
        byQuestionnaireStatus: questionnaireByCount,
        byRiskLevel: riskLevelByCount,
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
  deleteVendor,
  getDashboardStats,
};
