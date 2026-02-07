/**
 * Models Index
 * Central export point for all database models
 */

const User = require('./User');
const Control = require('./Control');
const Framework = require('./Framework');
const Policy = require('./Policy');
const Evidence = require('./Evidence');
const Test = require('./Test');
const Risk = require('./Risk');
const Vendor = require('./Vendor');
const Audit = require('./Audit');
const CloudIntegration = require('./CloudIntegration');
const Asset = require('./Asset');
const ClassificationRule = require('./ClassificationRule');
const SyncJob = require('./SyncJob');

module.exports = {
  User,
  Control,
  Framework,
  Policy,
  Evidence,
  Test,
  Risk,
  Vendor,
  Audit,
  CloudIntegration,
  Asset,
  ClassificationRule,
  SyncJob,
};
