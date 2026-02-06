const mongoose = require('mongoose');
const { CONSTANTS } = require('../config/constants');

const riskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a risk name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    riskCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CONSTANTS.RISK_STATUS),
      default: CONSTANTS.RISK_STATUS.OPEN,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot be more than 100 characters'],
    },
    likelihood: {
      type: String,
      enum: Object.values(CONSTANTS.RISK_LEVEL),
      required: [true, 'Please specify likelihood'],
    },
    impact: {
      type: String,
      enum: Object.values(CONSTANTS.RISK_LEVEL),
      required: [true, 'Please specify impact'],
    },
    riskScore: {
      type: Number,
      default: 0,
      min: [0, 'Risk score cannot be negative'],
      max: [9, 'Risk score cannot be more than 9'],
    },
    treatmentStrategy: {
      type: String,
      enum: ['accept', 'mitigate', 'transfer', 'avoid', null],
      default: null,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot be more than 100 characters'],
    },
    entities: {
      type: String,
      default: 'Organization Wide',
      trim: true,
    },
    mitigationPlan: {
      type: String,
      default: null,
      trim: true,
    },
    residualRisk: {
      type: String,
      default: null,
      trim: true,
    },
    controlRefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control',
      },
    ],
    reviewDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to calculate risk score
riskSchema.pre('save', function (next) {
  const levelValues = {
    [CONSTANTS.RISK_LEVEL.LOW]: 1,
    [CONSTANTS.RISK_LEVEL.MEDIUM]: 2,
    [CONSTANTS.RISK_LEVEL.HIGH]: 3,
  };

  const likelihoodScore = levelValues[this.likelihood] || 0;
  const impactScore = levelValues[this.impact] || 0;

  this.riskScore = likelihoodScore * impactScore;

  next();
});

// Indexes for frequently queried fields
riskSchema.index({ riskCode: 1 });
riskSchema.index({ status: 1 });
riskSchema.index({ category: 1 });
riskSchema.index({ likelihood: 1 });
riskSchema.index({ impact: 1 });
riskSchema.index({ riskScore: -1 });
riskSchema.index({ assignee: 1 });
riskSchema.index({ createdAt: -1 });

// Compound indexes for common queries
riskSchema.index({ status: 1, riskScore: -1 });
riskSchema.index({ likelihood: 1, impact: 1 });
riskSchema.index({ department: 1, status: 1 });

// Virtual for risk level display based on score
riskSchema.virtual('riskLevel').get(function () {
  if (this.riskScore <= 1) return CONSTANTS.RISK_LEVEL.LOW;
  if (this.riskScore <= 4) return CONSTANTS.RISK_LEVEL.MEDIUM;
  return CONSTANTS.RISK_LEVEL.HIGH;
});

// Virtual for days until review is due
riskSchema.virtual('daysUntilReview').get(function () {
  if (!this.reviewDate) return null;
  const today = new Date();
  const timeDiff = this.reviewDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Virtual for is review overdue
riskSchema.virtual('isReviewOverdue').get(function () {
  if (!this.reviewDate) return false;
  return this.reviewDate < new Date();
});

// Instance method to assess risk
riskSchema.methods.assess = function (notes = '') {
  this.status = CONSTANTS.RISK_STATUS.ASSESSED;
  if (notes) {
    this.description = notes;
  }
  return this.save();
};

// Instance method to start treatment
riskSchema.methods.startTreatment = function (strategy = 'mitigate') {
  this.status = CONSTANTS.RISK_STATUS.TREATMENT_IN_PROGRESS;
  this.treatmentStrategy = strategy;
  return this.save();
};

// Instance method to mark as treated
riskSchema.methods.markAsTreated = function (residualRiskNote = '') {
  this.status = CONSTANTS.RISK_STATUS.TREATED;
  if (residualRiskNote) {
    this.residualRisk = residualRiskNote;
  }
  return this.save();
};

// Instance method to close risk
riskSchema.methods.closeRisk = function () {
  this.status = CONSTANTS.RISK_STATUS.CLOSED;
  return this.save();
};

// Instance method to schedule review
riskSchema.methods.scheduleReview = function (daysFromNow = 90) {
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + daysFromNow);
  this.reviewDate = nextReview;
  return this.save();
};

module.exports = mongoose.model('Risk', riskSchema);
