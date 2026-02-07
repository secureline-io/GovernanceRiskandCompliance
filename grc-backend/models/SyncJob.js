const mongoose = require('mongoose');

const syncJobSchema = new mongoose.Schema(
  {
    integrationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CloudIntegration',
      required: [true, 'Please provide an integration reference'],
    },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
      default: 'queued',
    },
    triggerType: {
      type: String,
      enum: ['scheduled', 'manual', 'webhook'],
      default: 'manual',
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    progress: {
      currentService: {
        type: String,
        default: null,
      },
      currentRegion: {
        type: String,
        default: null,
      },
      servicesCompleted: {
        type: Number,
        default: 0,
      },
      servicesTotal: {
        type: Number,
        default: 0,
      },
      assetsDiscovered: {
        type: Number,
        default: 0,
      },
    },
    results: {
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
      unchangedAssets: {
        type: Number,
        default: 0,
      },
      staleAssets: {
        type: Number,
        default: 0,
      },
      errors: [
        {
          service: String,
          region: String,
          error: String,
        },
      ],
    },
    logs: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        level: {
          type: String,
          enum: ['info', 'warn', 'error', 'debug'],
          default: 'info',
        },
        message: String,
      },
    ],
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
syncJobSchema.index({ integrationRef: 1, status: 1 });
syncJobSchema.index({ createdAt: -1 });
syncJobSchema.index({ status: 1 });

module.exports = mongoose.model('SyncJob', syncJobSchema);
