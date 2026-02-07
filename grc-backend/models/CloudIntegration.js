const mongoose = require('mongoose');
const crypto = require('crypto');

const cloudIntegrationSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['aws', 'azure', 'gcp'],
      required: [true, 'Please provide a cloud provider'],
    },
    accountId: {
      type: String,
      required: [true, 'Please provide an account ID'],
    },
    accountAlias: {
      type: String,
      trim: true,
      maxlength: [200, 'Account alias cannot be more than 200 characters'],
    },
    roleArn: {
      type: String,
      required: [true, 'Please provide a role ARN'],
      trim: true,
    },
    externalId: {
      type: String,
      required: [true, 'Please provide an external ID'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'connected', 'failed', 'disconnected'],
      default: 'pending',
    },
    lastConnectionTest: {
      type: Date,
      default: null,
    },
    connectionError: {
      type: String,
      default: null,
    },
    regions: [
      {
        type: String,
        trim: true,
      },
    ],
    syncSchedule: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'manual'],
      default: 'daily',
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    lastSyncStatus: {
      type: String,
      enum: ['success', 'partial', 'failed', 'running', 'never'],
      default: 'never',
    },
    lastSyncDuration: {
      type: Number,
      default: null,
    },
    lastSyncStats: {
      totalAssets: {
        type: Number,
        default: 0,
      },
      newAssets: {
        type: Number,
        default: 0,
      },
      updatedAssets: {
        type: Number,
        default: 0,
      },
      staleAssets: {
        type: Number,
        default: 0,
      },
    },
    isOrganization: {
      type: Boolean,
      default: false,
    },
    memberAccounts: [
      {
        accountId: String,
        name: String,
        status: String,
      },
    ],
    enabledServices: [
      {
        type: String,
        trim: true,
      },
    ],
    entities: {
      type: String,
      default: 'Organization Wide',
      trim: true,
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

// Indexes
cloudIntegrationSchema.index({ accountId: 1 });
cloudIntegrationSchema.index({ provider: 1, accountId: 1 }, { unique: true });
cloudIntegrationSchema.index({ status: 1 });
cloudIntegrationSchema.index({ externalId: 1 });

// Instance method to generate external ID
cloudIntegrationSchema.methods.generateExternalId = function () {
  this.externalId = crypto.randomUUID();
  return this.externalId;
};

// Instance method to mark as connected
cloudIntegrationSchema.methods.markConnected = function () {
  this.status = 'connected';
  this.lastConnectionTest = new Date();
  this.connectionError = null;
  return this;
};

// Instance method to mark as failed
cloudIntegrationSchema.methods.markFailed = function (error) {
  this.status = 'failed';
  this.lastConnectionTest = new Date();
  this.connectionError = error || 'Unknown error';
  return this;
};

// Instance method to start sync
cloudIntegrationSchema.methods.startSync = function () {
  this.lastSyncStatus = 'running';
  return this;
};

// Instance method to complete sync
cloudIntegrationSchema.methods.completeSync = function (stats) {
  this.lastSyncAt = new Date();
  this.lastSyncStatus = stats.status || 'success';
  this.lastSyncStats = {
    totalAssets: stats.totalAssets || 0,
    newAssets: stats.newAssets || 0,
    updatedAssets: stats.updatedAssets || 0,
    staleAssets: stats.staleAssets || 0,
  };
  if (stats.duration) {
    this.lastSyncDuration = stats.duration;
  }
  return this;
};

module.exports = mongoose.model('CloudIntegration', cloudIntegrationSchema);
