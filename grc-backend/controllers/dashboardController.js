/**
 * Dashboard Controller
 * Aggregates statistics from all collections
 */

const {
  Control,
  Policy,
  Evidence,
  Test,
  Risk,
  Vendor,
  Audit,
  Framework,
} = require('../models');
const { CONSTANTS, HTTP_STATUS } = require('../config/constants');

/**
 * Get overall dashboard statistics
 * GET /api/v1/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Compliance stats from controls
    const controlStats = await Control.aggregate([
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
    const totalControls = compliantCount + nonCompliantCount + notApplicableCount;

    const controlsCompliancePercent =
      totalControls > 0
        ? Math.round((compliantCount / totalControls) * 100)
        : 0;

    // Policy stats
    const policyStats = await Policy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const policyStatsByStatus = {};
    policyStats.forEach((stat) => {
      policyStatsByStatus[stat._id] = stat.count;
    });

    // Evidence stats
    const evidenceStats = await Evidence.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const evidenceStatsByStatus = {};
    evidenceStats.forEach((stat) => {
      evidenceStatsByStatus[stat._id] = stat.count;
    });

    const uploadedEvidenceCount =
      evidenceStatsByStatus[CONSTANTS.EVIDENCE_STATUS.UPLOADED] || 0;
    const totalEvidence = Object.values(evidenceStatsByStatus).reduce(
      (a, b) => a + b,
      0
    );
    const evidenceCompliancePercent =
      totalEvidence > 0 ? Math.round((uploadedEvidenceCount / totalEvidence) * 100) : 0;

    // Test stats
    const testStats = await Test.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const testStatsByStatus = {};
    testStats.forEach((stat) => {
      testStatsByStatus[stat._id] = stat.count;
    });

    // Risk stats
    const riskStats = await Risk.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const riskStatsByStatus = {};
    riskStats.forEach((stat) => {
      riskStatsByStatus[stat._id] = stat.count;
    });

    const openRisks =
      riskStatsByStatus[CONSTANTS.RISK_STATUS.OPEN] || 0;
    const treatedRisks =
      riskStatsByStatus[CONSTANTS.RISK_STATUS.TREATED] || 0;
    const totalRisks = Object.values(riskStatsByStatus).reduce((a, b) => a + b, 0);

    // Framework compliance stats
    const frameworks = await Framework.find().select(
      'name compliancePercentage'
    );

    // Upcoming audits (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingAudits = await Audit.find({
      auditDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
      status: { $ne: CONSTANTS.AUDIT_STATUS.COMPLETED },
    })
      .select('name auditDate auditType status')
      .sort({ auditDate: 1 })
      .limit(5);

    // Risk heat map data (likelihood x impact)
    const riskHeatMap = await Risk.aggregate([
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

    const heatMapData = {};
    riskHeatMap.forEach((item) => {
      const key = `${item._id.likelihood}_${item._id.impact}`;
      heatMapData[key] = item.count;
    });

    // Vendor assessment stats
    const vendorStats = await Vendor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const vendorStatsByStatus = {};
    vendorStats.forEach((stat) => {
      vendorStatsByStatus[stat._id] = stat.count;
    });

    // Recent audits (in progress or completed)
    const recentAudits = await Audit.find({
      status: { $in: [CONSTANTS.AUDIT_STATUS.IN_PROGRESS, CONSTANTS.AUDIT_STATUS.COMPLETED] },
    })
      .select('name status auditType')
      .sort({ updatedAt: -1 })
      .limit(3);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        compliance: {
          controlsCompliance: controlsCompliancePercent,
          compliantControls: compliantCount,
          nonCompliantControls: nonCompliantCount,
          notApplicableControls: notApplicableCount,
          totalControls,
        },
        policies: {
          total: Object.values(policyStatsByStatus).reduce((a, b) => a + b, 0),
          byStatus: policyStatsByStatus,
        },
        evidence: {
          total: totalEvidence,
          uploadedCompliancePercent: evidenceCompliancePercent,
          byStatus: evidenceStatsByStatus,
        },
        tests: {
          total: Object.values(testStatsByStatus).reduce((a, b) => a + b, 0),
          byStatus: testStatsByStatus,
        },
        risks: {
          total: totalRisks,
          open: openRisks,
          treated: treatedRisks,
          byStatus: riskStatsByStatus,
          heatMap: heatMapData,
        },
        frameworks: frameworks.map((f) => ({
          id: f._id,
          name: f.name,
          compliance: f.compliancePercentage,
        })),
        vendors: {
          total: Object.values(vendorStatsByStatus).reduce((a, b) => a + b, 0),
          byStatus: vendorStatsByStatus,
        },
        audits: {
          upcoming: upcomingAudits,
          recentActivity: recentAudits,
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

/**
 * Get compliance trend over last 30 days
 * GET /api/v1/dashboard/compliance-trend
 */
const getComplianceTrend = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const complianceTrend = await Control.aggregate([
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
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Transform data into time series
    const trendMap = {};
    complianceTrend.forEach((item) => {
      const date = item._id.date;
      if (!trendMap[date]) {
        trendMap[date] = {
          date,
          compliant: 0,
          nonCompliant: 0,
          notApplicable: 0,
        };
      }

      if (item._id.status === CONSTANTS.CONTROL_STATUS.COMPLIANT) {
        trendMap[date].compliant = item.count;
      } else if (
        item._id.status === CONSTANTS.CONTROL_STATUS.NON_COMPLIANT
      ) {
        trendMap[date].nonCompliant = item.count;
      } else {
        trendMap[date].notApplicable = item.count;
      }
    });

    const trendData = Object.values(trendMap).map((item) => {
      const total =
        item.compliant + item.nonCompliant + item.notApplicable;
      return {
        ...item,
        compliancePercent:
          total > 0 ? Math.round((item.compliant / total) * 100) : 0,
      };
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: trendData,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get cloud security overview (mock data)
 * GET /api/v1/dashboard/cloud-security
 */
const getCloudSecurityOverview = async (req, res) => {
  try {
    // Mock AWS security data since we don't have real cloud integration
    const cloudSecurityData = {
      awsServices: [
        {
          name: 'EC2',
          status: 'compliant',
          complianceScore: 92,
          findings: 2,
        },
        {
          name: 'S3',
          status: 'compliant',
          complianceScore: 88,
          findings: 5,
        },
        {
          name: 'RDS',
          status: 'compliant',
          complianceScore: 95,
          findings: 1,
        },
        {
          name: 'IAM',
          status: 'nonCompliant',
          complianceScore: 72,
          findings: 12,
        },
        {
          name: 'Lambda',
          status: 'compliant',
          complianceScore: 85,
          findings: 3,
        },
      ],
      overallScore: 86,
      complianceStatus: 'MOSTLY_COMPLIANT',
      securityGroups: 24,
      encryptedVolumes: 18,
      unencryptedVolumes: 2,
      publicBuckets: 1,
      privateBuckets: 15,
      failedComplianceTests: 8,
      passedComplianceTests: 42,
      lastScan: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: cloudSecurityData,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getComplianceTrend,
  getCloudSecurityOverview,
};
