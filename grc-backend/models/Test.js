const mongoose = require('mongoose');
const { CONSTANTS } = require('../config/constants');

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a test name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    testCode: {
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
      enum: Object.values(CONSTANTS.TEST_STATUS),
      default: CONSTANTS.TEST_STATUS.NEEDS_ATTENTION,
    },
    type: {
      type: String,
      enum: Object.values(CONSTANTS.TEST_TYPE),
      required: [true, 'Please specify a test type'],
    },
    effortEstimate: {
      type: String,
      enum: Object.values(CONSTANTS.EFFORT_ESTIMATE),
      default: CONSTANTS.EFFORT_ESTIMATE.MEDIUM,
    },
    application: {
      type: String,
      default: 'Scrut',
      trim: true,
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    framework: {
      type: String,
      enum: [null, ...Object.values(CONSTANTS.FRAMEWORK)],
      default: null,
    },
    controlRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Control',
      default: null,
    },
    lastRunDate: {
      type: Date,
      default: null,
    },
    nextRunDate: {
      type: Date,
      default: null,
    },
    result: {
      type: String,
      default: null,
      trim: true,
    },
    isMapped: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Indexes for frequently queried fields
testSchema.index({ testCode: 1 });
testSchema.index({ status: 1 });
testSchema.index({ type: 1 });
testSchema.index({ framework: 1 });
testSchema.index({ controlRef: 1 });
testSchema.index({ createdAt: -1 });

// Compound indexes for common queries
testSchema.index({ status: 1, type: 1 });
testSchema.index({ framework: 1, status: 1 });
testSchema.index({ controlRef: 1, status: 1 });

// Virtual for days until next run
testSchema.virtual('daysUntilNextRun').get(function () {
  if (!this.nextRunDate) return null;
  const today = new Date();
  const timeDiff = this.nextRunDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Virtual for is next run overdue
testSchema.virtual('isNextRunOverdue').get(function () {
  if (!this.nextRunDate) return false;
  return this.nextRunDate < new Date();
});

// Instance method to mark test as passed
testSchema.methods.markAsPassed = function (resultDetails = '') {
  this.status = CONSTANTS.TEST_STATUS.OK;
  this.lastRunDate = new Date();
  this.result = resultDetails;
  return this.save();
};

// Instance method to mark test as failed
testSchema.methods.markAsFailed = function (resultDetails = '') {
  this.status = CONSTANTS.TEST_STATUS.NEEDS_ATTENTION;
  this.lastRunDate = new Date();
  this.result = resultDetails;
  return this.save();
};

// Instance method to schedule next run
testSchema.methods.scheduleNextRun = function (daysFromNow = 7) {
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + daysFromNow);
  this.nextRunDate = nextRun;
  return this.save();
};

module.exports = mongoose.model('Test', testSchema);
