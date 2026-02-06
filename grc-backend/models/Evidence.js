const mongoose = require('mongoose');
const { CONSTANTS } = require('../config/constants');

const evidenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide evidence name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    evidenceCode: {
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
      enum: Object.values(CONSTANTS.EVIDENCE_STATUS),
      default: CONSTANTS.EVIDENCE_STATUS.NOT_UPLOADED,
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
    framework: {
      type: String,
      enum: [null, ...Object.values(CONSTANTS.FRAMEWORK)],
      default: null,
    },
    entities: {
      type: String,
      default: 'Organization Wide',
      trim: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    controlRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Control',
      default: null,
    },
    uploadDate: {
      type: Date,
      default: null,
    },
    reviewDate: {
      type: Date,
      default: null,
    },
    nextReviewDate: {
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

// Indexes for frequently queried fields
evidenceSchema.index({ evidenceCode: 1 });
evidenceSchema.index({ status: 1 });
evidenceSchema.index({ department: 1 });
evidenceSchema.index({ framework: 1 });
evidenceSchema.index({ controlRef: 1 });
evidenceSchema.index({ assignee: 1 });
evidenceSchema.index({ createdAt: -1 });

// Compound indexes for common queries
evidenceSchema.index({ status: 1, framework: 1 });
evidenceSchema.index({ controlRef: 1, status: 1 });

// Virtual for days until next review
evidenceSchema.virtual('daysUntilReview').get(function () {
  if (!this.nextReviewDate) return null;
  const today = new Date();
  const timeDiff = this.nextReviewDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Virtual for is review overdue
evidenceSchema.virtual('isReviewOverdue').get(function () {
  if (!this.nextReviewDate) return false;
  return this.nextReviewDate < new Date();
});

// Instance method to mark as uploaded
evidenceSchema.methods.markAsUploaded = function () {
  this.status = CONSTANTS.EVIDENCE_STATUS.UPLOADED;
  this.uploadDate = new Date();
  return this.save();
};

// Instance method to schedule next review
evidenceSchema.methods.scheduleReview = function (daysFromNow = 90) {
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + daysFromNow);
  this.nextReviewDate = nextReview;
  return this.save();
};

module.exports = mongoose.model('Evidence', evidenceSchema);
