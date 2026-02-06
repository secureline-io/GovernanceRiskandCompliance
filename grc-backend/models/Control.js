const mongoose = require('mongoose');
const { CONSTANTS } = require('../config/constants');

const controlSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a control name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    controlCode: {
      type: String,
      required: [true, 'Please provide a control code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CONSTANTS.CONTROL_STATUS),
      default: CONSTANTS.CONTROL_STATUS.COMPLIANT,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    controlDomain: {
      type: String,
      trim: true,
      maxlength: [100, 'Control domain cannot be more than 100 characters'],
    },
    framework: {
      type: String,
      enum: [null, ...Object.values(CONSTANTS.FRAMEWORK)],
      default: null,
    },
    functionGrouping: {
      type: String,
      enum: [null, ...Object.values(CONSTANTS.FUNCTION_GROUPING)],
      default: null,
    },
    entities: {
      type: String,
      default: 'Organization Wide',
      trim: true,
    },
    controlScope: {
      type: String,
      trim: true,
    },
    evidences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    policies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy',
      },
    ],
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
controlSchema.index({ controlCode: 1 });
controlSchema.index({ status: 1 });
controlSchema.index({ framework: 1 });
controlSchema.index({ functionGrouping: 1 });
controlSchema.index({ assignee: 1 });
controlSchema.index({ createdAt: -1 });

// Compound indexes for common queries
controlSchema.index({ framework: 1, status: 1 });
controlSchema.index({ functionGrouping: 1, status: 1 });

module.exports = mongoose.model('Control', controlSchema);
