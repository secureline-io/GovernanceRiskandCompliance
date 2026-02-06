const mongoose = require('mongoose');

const frameworkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a framework name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    version: {
      type: String,
      default: '1.0',
      trim: true,
    },
    compliancePercentage: {
      type: Number,
      min: [0, 'Compliance percentage cannot be less than 0'],
      max: [100, 'Compliance percentage cannot be more than 100'],
      default: 0,
    },
    policiesCompliance: {
      type: Number,
      min: [0, 'Policies compliance cannot be less than 0'],
      max: [100, 'Policies compliance cannot be more than 100'],
      default: 0,
    },
    evidenceTasksCompliance: {
      type: Number,
      min: [0, 'Evidence tasks compliance cannot be less than 0'],
      max: [100, 'Evidence tasks compliance cannot be more than 100'],
      default: 0,
    },
    automatedTestsCompliance: {
      type: Number,
      min: [0, 'Automated tests compliance cannot be less than 0'],
      max: [100, 'Automated tests compliance cannot be more than 100'],
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    controlsCount: {
      type: Number,
      default: 0,
      min: [0, 'Controls count cannot be negative'],
    },
    compliantControls: {
      type: Number,
      default: 0,
      min: [0, 'Compliant controls cannot be negative'],
    },
    nonCompliantControls: {
      type: Number,
      default: 0,
      min: [0, 'Non-compliant controls cannot be negative'],
    },
    notApplicableControls: {
      type: Number,
      default: 0,
      min: [0, 'Not applicable controls cannot be negative'],
    },
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
frameworkSchema.index({ name: 1 });
frameworkSchema.index({ isCustom: 1 });
frameworkSchema.index({ createdAt: -1 });

// Virtual for overall control status
frameworkSchema.virtual('overallStatus').get(function () {
  if (this.controlsCount === 0) return 'No Controls';
  const nonCompliant =
    ((this.nonCompliantControls / this.controlsCount) * 100).toFixed(0) + '%';
  return nonCompliant;
});

module.exports = mongoose.model('Framework', frameworkSchema);
