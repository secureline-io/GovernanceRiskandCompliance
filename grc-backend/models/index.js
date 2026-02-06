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
};
