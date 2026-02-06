const mongoose = require('mongoose');
const { CONSTANTS } = require('../config/constants');

const mitigationTaskSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: [true, 'Please provide a task description'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed'],
      default: 'open',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a vendor name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    vendorCode: {
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
      enum: Object.values(CONSTANTS.VENDOR_STATUS),
      default: CONSTANTS.VENDOR_STATUS.NOT_ASSESSED,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot be more than 100 characters'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    entities: {
      type: String,
      default: 'Organization Wide',
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact name cannot be more than 100 characters'],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    website: {
      type: String,
      trim: true,
      default: null,
    },
    riskLevel: {
      type: String,
      enum: [null, ...Object.values(CONSTANTS.RISK_LEVEL)],
      default: null,
    },
    questionnaireStatus: {
      type: String,
      enum: ['created', 'submitted', 'assessed', 'overdue'],
      default: 'created',
    },
    assessmentDate: {
      type: Date,
      default: null,
    },
    nextReassessmentDate: {
      type: Date,
      default: null,
    },
    mitigationTasks: [mitigationTaskSchema],
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
vendorSchema.index({ vendorCode: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ category: 1 });
vendorSchema.index({ riskLevel: 1 });
vendorSchema.index({ questionnaireStatus: 1 });
vendorSchema.index({ assignee: 1 });
vendorSchema.index({ createdAt: -1 });

// Compound indexes for common queries
vendorSchema.index({ status: 1, riskLevel: 1 });
vendorSchema.index({ questionnaireStatus: 1, status: 1 });

// Virtual for days until reassessment
vendorSchema.virtual('daysUntilReassessment').get(function () {
  if (!this.nextReassessmentDate) return null;
  const today = new Date();
  const timeDiff = this.nextReassessmentDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Virtual for is reassessment overdue
vendorSchema.virtual('isReassessmentOverdue').get(function () {
  if (!this.nextReassessmentDate) return false;
  return this.nextReassessmentDate < new Date();
});

// Virtual for pending mitigation tasks count
vendorSchema.virtual('pendingMitigationTasksCount').get(function () {
  if (!this.mitigationTasks || this.mitigationTasks.length === 0) return 0;
  return this.mitigationTasks.filter((task) => task.status !== 'completed').length;
});

// Instance method to add mitigation task
vendorSchema.methods.addMitigationTask = function (taskDescription, dueDate) {
  this.mitigationTasks.push({
    task: taskDescription,
    status: 'open',
    dueDate: dueDate,
  });
  return this.save();
};

// Instance method to mark mitigation task as completed
vendorSchema.methods.completeMitigationTask = function (taskIndex) {
  if (this.mitigationTasks[taskIndex]) {
    this.mitigationTasks[taskIndex].status = 'completed';
  }
  return this.save();
};

// Instance method to start assessment
vendorSchema.methods.startAssessment = function () {
  this.status = CONSTANTS.VENDOR_STATUS.IN_PROGRESS;
  this.questionnaireStatus = 'submitted';
  return this.save();
};

// Instance method to complete assessment
vendorSchema.methods.completeAssessment = function (riskLevel) {
  this.status = CONSTANTS.VENDOR_STATUS.ASSESSED;
  this.questionnaireStatus = 'assessed';
  this.riskLevel = riskLevel;
  this.assessmentDate = new Date();
  return this.save();
};

// Instance method to schedule reassessment
vendorSchema.methods.scheduleReassessment = function (daysFromNow = 365) {
  const nextReassessment = new Date();
  nextReassessment.setDate(nextReassessment.getDate() + daysFromNow);
  this.nextReassessmentDate = nextReassessment;
  this.status = CONSTANTS.VENDOR_STATUS.NEEDS_REASSESSMENT;
  return this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema);
