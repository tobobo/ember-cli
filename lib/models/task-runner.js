'use strict';

function TaskRunner(options) {
  this.ui        = options.ui;
  this.analytics = options.analytics;
  this.project   = options.project;
  this.tasks     = options.tasks;
}

module.exports = TaskRunner;

TaskRunner.__proto__ = require('./core-object');

TaskRunner.prototype.run = function(/*options*/) {
  throw new Error('TaskRunner needs to have run() defined.');
};
