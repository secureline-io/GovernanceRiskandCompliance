const mongoose = require('mongoose');
const crypto = require('crypto');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      unique: true,
      required: [true, 'Please provide an asset ID'],
      trim: true,
    },
    provider: {
      type: String,
      enum: ['aws', 'azure', 'gcp'],
      required: [true, 'Please provide a cloud provider'],
    },
    integrationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CloudIntegration',
      required: [true, 'Please provide an integration reference'],
    },
    accountId: {
      type: String,
      required: [true, 'Please provide an account ID'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Please provide a region'],
      trim: true,
    },
    service: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
    },
    resourceType: {
      type: String,
      required: [true, 'Please provide a resource type'],
      trim: true,
    },
    resourceArn: {
      type: String,
      unique: true,
      required: [true, 'Please provide a resource ARN'],
      trim: true,
    },
    resourceId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [500, 'Name cannot be more than 500 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    tags: {
      type: Map,
      of: String,
      default: new Map(),
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    environment: {
      type: String,
      enum: ['production', 'staging', 'development', 'testing', 'unknown'],
      default: 'unknown',
    },
    owner: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    dataClassification: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted', 'unclassified'],
      default: 'unclassified',
    },
    criticality: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'unclassified'],
      default: 'unclassified',
    },
    isInternetExposed: {
      type: Boolean,
      default: false,
    },
    complianceStatus: {
      type: String,
      enum: ['compliant', 'non_compliant', 'unknown'],
      default: 'unknown',
    },
    lifecycleState: {
      type: String,
      enum: ['active', 'stale', 'deleted'],
      default: 'active',
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    staleAfterDays: {
      type: Number,
      default: 7,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    relationships: [
      {
        relationType: {
          type: String,
          enum: [
            'belongs_to',
            'contains',
            'attached_to',
            'secured_by',
            'routes_to',
            'backed_by',
            'managed_by',
          ],
        },
        targetArn: String,
        targetAssetRef: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Asset',
        },
        targetResourceType: String,
      },
    ],
    changeHistory: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: String,
      },
    ],
    classificationOverrides: {
      environment: {
        value: String,
        overriddenBy: mongoose.Schema.Types.ObjectId,
        overriddenAt: Date,
      },
      owner: {
        value: String,
        overriddenBy: mongoose.Schema.Types.ObjectId,
        overriddenAt: Date,
      },
      dataClassification: {
        value: String,
        overriddenBy: mongoose.Schema.Types.ObjectId,
        overriddenAt: Date,
      },
      criticality: {
        value: String,
        overriddenBy: mongoose.Schema.Types.ObjectId,
        overriddenAt: Date,
      },
    },
    createdBy: {
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
assetSchema.index({ resourceArn: 1 });
assetSchema.index({ assetId: 1 });
assetSchema.index({ provider: 1, accountId: 1, region: 1 });
assetSchema.index({ service: 1, resourceType: 1 });
assetSchema.index({ lifecycleState: 1 });
assetSchema.index({ environment: 1 });
assetSchema.index({ criticality: 1 });
assetSchema.index({ isInternetExposed: 1 });
assetSchema.index({ lastSeen: 1 });
assetSchema.index({ name: 'text', resourceArn: 'text', resourceId: 'text' });

// Virtual to check if asset is stale
assetSchema.virtual('isStale').get(function () {
  const lastSeenTime = this.lastSeen.getTime();
  const staleThresholdMs = this.staleAfterDays * 24 * 60 * 60 * 1000;
  return Date.now() - lastSeenTime > staleThresholdMs;
});

// Virtual to calculate days since last seen
assetSchema.virtual('daysSinceLastSeen').get(function () {
  const lastSeenTime = this.lastSeen.getTime();
  const daysDiff = (Date.now() - lastSeenTime) / (24 * 60 * 60 * 1000);
  return Math.floor(daysDiff);
});

// Pre-save hook to auto-generate assetId if not set
assetSchema.pre('save', function (next) {
  if (!this.assetId) {
    const hash = crypto
      .createHash('md5')
      .update(`${this.provider}-${this.resourceArn}`)
      .digest('hex')
      .substring(0, 8);
    this.assetId = `AST-${this.provider.toUpperCase()}-${hash}`;
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
