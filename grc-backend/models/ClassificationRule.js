const mongoose = require('mongoose');

const classificationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a rule name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 100,
    },
    ruleType: {
      type: String,
      enum: ['tag_match', 'service_match', 'exposure_check', 'naming_pattern', 'composite'],
      required: [true, 'Please provide a rule type'],
    },
    conditions: {
      tagKey: {
        type: String,
        trim: true,
      },
      tagValue: {
        type: String,
        trim: true,
      },
      tagExists: {
        type: Boolean,
        default: false,
      },
      service: {
        type: String,
        trim: true,
      },
      resourceType: {
        type: String,
        trim: true,
      },
      namePattern: {
        type: String,
        trim: true,
      },
      operator: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'AND',
      },
      subConditions: [mongoose.Schema.Types.Mixed],
    },
    actions: {
      setEnvironment: {
        type: String,
        enum: [null, 'production', 'staging', 'development', 'testing', 'unknown'],
        default: null,
      },
      setOwner: {
        type: String,
        trim: true,
      },
      setDepartment: {
        type: String,
        trim: true,
      },
      setDataClassification: {
        type: String,
        enum: [null, 'public', 'internal', 'confidential', 'restricted', 'unclassified'],
        default: null,
      },
      setCriticality: {
        type: String,
        enum: [null, 'critical', 'high', 'medium', 'low', 'unclassified'],
        default: null,
      },
    },
    appliedCount: {
      type: Number,
      default: 0,
    },
    lastAppliedAt: {
      type: Date,
      default: null,
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

// Indexes
classificationRuleSchema.index({ isActive: 1, priority: 1 });
classificationRuleSchema.index({ ruleType: 1 });
classificationRuleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('ClassificationRule', classificationRuleSchema);
