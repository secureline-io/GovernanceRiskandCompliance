/**
 * Application Constants and Enums
 * Centralized definition of all constants used across the application
 */

const CONSTANTS = {
  // User Roles
  USER_ROLES: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    AUDITOR: 'AUDITOR',
    VIEWER: 'VIEWER',
  },

  // Control Statuses
  CONTROL_STATUS: {
    COMPLIANT: 'COMPLIANT',
    NON_COMPLIANT: 'NON_COMPLIANT',
    NOT_APPLICABLE: 'NOT_APPLICABLE',
  },

  // Policy Statuses
  POLICY_STATUS: {
    NOT_UPLOADED: 'NOT_UPLOADED',
    DRAFT: 'DRAFT',
    NEEDS_REVIEW: 'NEEDS_REVIEW',
    PUBLISHED: 'PUBLISHED',
  },

  // Evidence Statuses
  EVIDENCE_STATUS: {
    NOT_UPLOADED: 'NOT_UPLOADED',
    DRAFT: 'DRAFT',
    NEEDS_ATTENTION: 'NEEDS_ATTENTION',
    UPLOADED: 'UPLOADED',
  },

  // Test Statuses
  TEST_STATUS: {
    OK: 'OK',
    NEEDS_ATTENTION: 'NEEDS_ATTENTION',
    IGNORED: 'IGNORED',
  },

  // Test Types
  TEST_TYPE: {
    AUTOMATED_TEST: 'AUTOMATED_TEST',
    POLICY: 'POLICY',
    EVIDENCE: 'EVIDENCE',
  },

  // Risk Statuses
  RISK_STATUS: {
    OPEN: 'OPEN',
    ASSESSED: 'ASSESSED',
    TREATMENT_IN_PROGRESS: 'TREATMENT_IN_PROGRESS',
    TREATED: 'TREATED',
    MONITOR: 'MONITOR',
    CLOSED: 'CLOSED',
  },

  // Risk Levels
  RISK_LEVEL: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
  },

  // Vendor Statuses
  VENDOR_STATUS: {
    NOT_ASSESSED: 'NOT_ASSESSED',
    IN_PROGRESS: 'IN_PROGRESS',
    ASSESSED: 'ASSESSED',
    NEEDS_REASSESSMENT: 'NEEDS_REASSESSMENT',
  },

  // Audit Statuses
  AUDIT_STATUS: {
    UPCOMING: 'UPCOMING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
  },

  // Audit Types
  AUDIT_TYPE: {
    INTERNAL: 'INTERNAL',
    EXTERNAL: 'EXTERNAL',
  },

  // Framework Names
  FRAMEWORK: {
    GDPR: 'GDPR',
    SOC_2: 'SOC_2',
    ISO_27001: 'ISO_27001',
    HIPAA: 'HIPAA',
    PCI_DSS: 'PCI_DSS',
  },

  // Function Groupings (NIST Cybersecurity Framework)
  FUNCTION_GROUPING: {
    IDENTIFY: 'IDENTIFY',
    PROTECT: 'PROTECT',
    DETECT: 'DETECT',
    RESPOND: 'RESPOND',
    RECOVER: 'RECOVER',
    GOVERN: 'GOVERN',
  },

  // Effort Estimates
  EFFORT_ESTIMATE: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
  },
};

/**
 * Validation sets for enum values
 */
const VALID_VALUES = {
  userRoles: Object.values(CONSTANTS.USER_ROLES),
  controlStatus: Object.values(CONSTANTS.CONTROL_STATUS),
  policyStatus: Object.values(CONSTANTS.POLICY_STATUS),
  evidenceStatus: Object.values(CONSTANTS.EVIDENCE_STATUS),
  testStatus: Object.values(CONSTANTS.TEST_STATUS),
  testType: Object.values(CONSTANTS.TEST_TYPE),
  riskStatus: Object.values(CONSTANTS.RISK_STATUS),
  riskLevel: Object.values(CONSTANTS.RISK_LEVEL),
  vendorStatus: Object.values(CONSTANTS.VENDOR_STATUS),
  auditStatus: Object.values(CONSTANTS.AUDIT_STATUS),
  auditType: Object.values(CONSTANTS.AUDIT_TYPE),
  framework: Object.values(CONSTANTS.FRAMEWORK),
  functionGrouping: Object.values(CONSTANTS.FUNCTION_GROUPING),
  effortEstimate: Object.values(CONSTANTS.EFFORT_ESTIMATE),
};

/**
 * Permission levels based on roles
 */
const ROLE_PERMISSIONS = {
  [CONSTANTS.USER_ROLES.ADMIN]: [
    'read',
    'create',
    'update',
    'delete',
    'manage_users',
    'manage_frameworks',
    'audit_logs',
  ],
  [CONSTANTS.USER_ROLES.MANAGER]: [
    'read',
    'create',
    'update',
    'submit_evidence',
    'view_risks',
  ],
  [CONSTANTS.USER_ROLES.AUDITOR]: ['read', 'view_reports', 'verify_controls'],
  [CONSTANTS.USER_ROLES.VIEWER]: ['read'],
};

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Error Messages
 */
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  INVALID_TOKEN: 'Invalid authentication token',
  MISSING_TOKEN: 'Authentication token is required',
  UNAUTHORIZED_ACTION: 'You are not authorized to perform this action',

  // Validation
  INVALID_INPUT: 'Invalid input data',
  MISSING_REQUIRED_FIELD: 'Missing required field',
  INVALID_EMAIL: 'Invalid email format',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',

  // Resource
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CONFLICT: 'Resource conflict',

  // Database
  DB_CONNECTION_ERROR: 'Database connection error',
  DB_OPERATION_ERROR: 'Database operation failed',

  // Server
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};

/**
 * Pagination Defaults
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

/**
 * Rate Limiting Config
 */
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // requests per windowMs
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
  LOGIN_MAX_REQUESTS: 5,
};

/**
 * File Upload Config
 */
const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/png',
    'image/jpeg',
  ],
  UPLOAD_DIR: 'uploads',
};

/**
 * Cache Configuration
 */
const CACHE = {
  DEFAULT_TTL: 3600, // 1 hour in seconds
  SHORT_TTL: 300, // 5 minutes
  LONG_TTL: 86400, // 24 hours
};

module.exports = {
  CONSTANTS,
  VALID_VALUES,
  ROLE_PERMISSIONS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  PAGINATION,
  RATE_LIMIT,
  FILE_UPLOAD,
  CACHE,
};
