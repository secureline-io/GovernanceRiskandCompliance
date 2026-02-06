const mongoose = require('mongoose');
const { CONSTANTS } = require('../config/constants');

const findingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a finding title'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a request title'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const correctiveActionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an action title'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed'],
      default: 'open',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const auditSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an audit name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    auditCode: {
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
      enum: Object.values(CONSTANTS.AUDIT_STATUS),
      default: CONSTANTS.AUDIT_STATUS.UPCOMING,
    },
    auditType: {
      type: String,
      enum: Object.values(CONSTANTS.AUDIT_TYPE),
      required: [true, 'Please specify audit type'],
    },
    auditDate: {
      type: Date,
      required: [true, 'Please provide an audit date'],
    },
    observationPeriodStart: {
      type: Date,
      default: null,
    },
    observationPeriodEnd: {
      type: Date,
      default: null,
    },
    entities: {
      type: String,
      default: 'Organization Wide',
      trim: true,
    },
    auditorName: {
      type: String,
      trim: true,
      maxlength: [100, 'Auditor name cannot be more than 100 characters'],
    },
    auditorFirm: {
      type: String,
      trim: true,
      maxlength: [100, 'Auditor firm cannot be more than 100 characters'],
    },
    framework: {
      type: String,
      enum: [null, ...Object.values(CONSTANTS.FRAMEWORK)],
      default: null,
    },
    findings: [findingSchema],
    requests: [requestSchema],
    correctiveActions: [correctiveActionSchema],
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
auditSchema.index({ auditCode: 1 });
auditSchema.index({ status: 1 });
auditSchema.index({ auditType: 1 });
auditSchema.index({ auditDate: -1 });
auditSchema.index({ framework: 1 });
auditSchema.index({ createdAt: -1 });

// Compound indexes for common queries
auditSchema.index({ status: 1, auditType: 1 });
auditSchema.index({ auditDate: -1, status: 1 });

// Virtual for days until audit
auditSchema.virtual('daysUntilAudit').get(function () {
  const today = new Date();
  const timeDiff = this.auditDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Virtual for is audit overdue
auditSchema.virtual('isAuditOverdue').get(function () {
  return this.auditDate < new Date();
});

// Virtual for findings count by severity
auditSchema.virtual('findingsBySeverity').get(function () {
  const counts = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  if (this.findings && this.findings.length > 0) {
    this.findings.forEach((finding) => {
      counts[finding.severity]++;
    });
  }
  return counts;
});

// Virtual for open findings count
auditSchema.virtual('openFindingsCount').get(function () {
  if (!this.findings || this.findings.length === 0) return 0;
  return this.findings.filter((finding) => finding.status === 'open').length;
});

// Virtual for pending requests count
auditSchema.virtual('pendingRequestsCount').get(function () {
  if (!this.requests || this.requests.length === 0) return 0;
  return this.requests.filter((request) => request.status === 'pending').length;
});

// Virtual for open corrective actions count
auditSchema.virtual('openCorrectiveActionsCount').get(function () {
  if (!this.correctiveActions || this.correctiveActions.length === 0) return 0;
  return this.correctiveActions.filter(
    (action) => action.status === 'open'
  ).length;
});

// Instance method to add finding
auditSchema.methods.addFinding = function (
  title,
  description,
  severity = 'medium'
) {
  this.findings.push({
    title,
    description,
    severity,
    status: 'open',
  });
  return this.save();
};

// Instance method to add audit request
auditSchema.methods.addRequest = function (title, description, dueDate) {
  this.requests.push({
    title,
    description,
    status: 'pending',
    dueDate,
  });
  return this.save();
};

// Instance method to add corrective action
auditSchema.methods.addCorrectiveAction = function (
  title,
  description,
  assignee,
  dueDate
) {
  this.correctiveActions.push({
    title,
    description,
    assignee,
    dueDate,
    status: 'open',
  });
  return this.save();
};

// Instance method to mark audit as in progress
auditSchema.methods.startAudit = function (periodStart, periodEnd) {
  this.status = CONSTANTS.AUDIT_STATUS.IN_PROGRESS;
  this.observationPeriodStart = periodStart;
  this.observationPeriodEnd = periodEnd;
  return this.save();
};

// Instance method to complete audit
auditSchema.methods.completeAudit = function () {
  this.status = CONSTANTS.AUDIT_STATUS.COMPLETED;
  return this.save();
};

module.exports = mongoose.model('Audit', auditSchema);
