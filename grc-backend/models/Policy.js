const mongoose = require('mongoose');
const { CONSTANTS } = require('../config/constants');

const policySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a policy name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    policyCode: {
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
      enum: Object.values(CONSTANTS.POLICY_STATUS),
      default: CONSTANTS.POLICY_STATUS.NOT_UPLOADED,
    },
    version: {
      type: String,
      default: '1.0',
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot be more than 100 characters'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    content: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    reviewDate: {
      type: Date,
      default: null,
    },
    publishDate: {
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
policySchema.index({ policyCode: 1 });
policySchema.index({ status: 1 });
policySchema.index({ department: 1 });
policySchema.index({ framework: 1 });
policySchema.index({ assignee: 1 });
policySchema.index({ createdAt: -1 });

// Compound indexes for common queries
policySchema.index({ status: 1, framework: 1 });
policySchema.index({ department: 1, status: 1 });

// Instance method to mark as published
policySchema.methods.publish = function () {
  this.status = CONSTANTS.POLICY_STATUS.PUBLISHED;
  this.publishDate = new Date();
  return this.save();
};

// Instance method to mark for review
policySchema.methods.requestReview = function () {
  this.status = CONSTANTS.POLICY_STATUS.NEEDS_REVIEW;
  return this.save();
};

module.exports = mongoose.model('Policy', policySchema);
