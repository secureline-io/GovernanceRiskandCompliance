/**
 * Controllers Index
 * Central export point for all controllers
 */

const authController = require('./authController');
const dashboardController = require('./dashboardController');
const controlsController = require('./controlsController');
const frameworksController = require('./frameworksController');
const policiesController = require('./policiesController');
const evidencesController = require('./evidencesController');
const testsController = require('./testsController');
const risksController = require('./risksController');
const vendorsController = require('./vendorsController');
const auditsController = require('./auditsController');

module.exports = {
  authController,
  dashboardController,
  controlsController,
  frameworksController,
  policiesController,
  evidencesController,
  testsController,
  risksController,
  vendorsController,
  auditsController,
};
