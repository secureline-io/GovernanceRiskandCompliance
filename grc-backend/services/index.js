/**
 * GRC Platform Services
 *
 * Core services for AWS discovery, classification, and sync scheduling
 */

const awsDiscovery = require('./awsDiscovery');
const classificationEngine = require('./classificationEngine');
const syncScheduler = require('./syncScheduler');

module.exports = {
  awsDiscovery,
  classificationEngine,
  syncScheduler,
};
