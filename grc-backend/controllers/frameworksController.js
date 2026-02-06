/**
 * Frameworks Controller
 * CRUD operations for compliance frameworks
 */

const { Framework, Control } = require('../models');
const { HTTP_STATUS, CONSTANTS, PAGINATION } = require('../config/constants');

/**
 * Get all frameworks with sorting by compliance
 * GET /api/v1/frameworks?page=1&limit=20&sort=-compliancePercentage
 */
const getAll = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sort = '-compliancePercentage',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const total = await Framework.countDocuments();
    const frameworks = await Framework.find()
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: frameworks,
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
 * Get single framework by ID
 * GET /api/v1/frameworks/:id
 */
const getById = async (req, res) => {
  try {
    const framework = await Framework.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!framework) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Framework not found',
      });
    }

    // Get controls for this framework
    const controls = await Control.find({ framework: framework.name }).select(
      'name controlCode status'
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        ...framework.toObject(),
        controls,
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
 * Create new framework
 * POST /api/v1/frameworks
 */
const create = async (req, res) => {
  try {
    const { name, description, version, isCustom, entities } = req.body;

    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Framework name is required',
      });
    }

    const framework = await Framework.create({
      name,
      description,
      version: version || '1.0',
      isCustom: isCustom || false,
      entities: entities || 'Organization Wide',
      createdBy: req.user._id,
    });

    await framework.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Framework created successfully',
      data: framework,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Framework name already exists',
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update framework
 * PUT /api/v1/frameworks/:id
 */
const update = async (req, res) => {
  try {
    const { description, version, entities } = req.body;

    let framework = await Framework.findById(req.params.id);

    if (!framework) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Framework not found',
      });
    }

    if (description !== undefined) framework.description = description;
    if (version) framework.version = version;
    if (entities) framework.entities = entities;

    framework = await framework.save();
    await framework.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Framework updated successfully',
      data: framework,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete framework
 * DELETE /api/v1/frameworks/:id
 */
const deleteFramework = async (req, res) => {
  try {
    const framework = await Framework.findByIdAndDelete(req.params.id);

    if (!framework) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Framework not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Framework deleted successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Recalculate compliance stats for a framework
 * POST /api/v1/frameworks/:id/recalculate-compliance
 */
const recalculateCompliance = async (req, res) => {
  try {
    let framework = await Framework.findById(req.params.id);

    if (!framework) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Framework not found',
      });
    }

    // Get all controls for this framework
    const controlStats = await Control.aggregate([
      {
        $match: { framework: framework.name },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const compliantCount =
      controlStats.find((s) => s._id === CONSTANTS.CONTROL_STATUS.COMPLIANT)
        ?.count || 0;
    const nonCompliantCount =
      controlStats.find((s) => s._id === CONSTANTS.CONTROL_STATUS.NON_COMPLIANT)
        ?.count || 0;
    const notApplicableCount =
      controlStats.find((s) => s._id === CONSTANTS.CONTROL_STATUS.NOT_APPLICABLE)
        ?.count || 0;

    const totalControls =
      compliantCount + nonCompliantCount + notApplicableCount;

    // Update framework
    framework.controlsCount = totalControls;
    framework.compliantControls = compliantCount;
    framework.nonCompliantControls = nonCompliantCount;
    framework.notApplicableControls = notApplicableCount;

    if (totalControls > 0) {
      framework.compliancePercentage = Math.round(
        (compliantCount / totalControls) * 100
      );
    } else {
      framework.compliancePercentage = 0;
    }

    framework = await framework.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Framework compliance recalculated successfully',
      data: framework,
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
  deleteFramework,
  recalculateCompliance,
};
