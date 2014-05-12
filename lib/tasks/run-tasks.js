'use strict';

var Promise          = require('../ext/promise');
var Task             = require('../models/task');
var chalk            = require('chalk');
var requireAsHash    = require('../utilities/require-as-hash');
var taskRunners      = requireAsHash('task-runners/*.js');

module.exports = Task.extend({

  getTaskRunner: function() {
    var pkg = require(this.project.root + '/package');
    var deps = pkg['devDependencies'];
    var taskRunnerArguments = {
      project: this.project,
      tasks: this.tasks,
      ui: this.ui,
      analytics: this.analytics
    }

    for (var runner in taskRunners) {
      var taskRunner = new taskRunners[runner](taskRunnerArguments);
      if (taskRunner.module != 'Npm' &&
        deps.hasOwnProperty(taskRunner.module)) {
        return taskRunner;
      }
    }

    return new taskRunners.Npm(taskRunnerArguments);

  },

  runTasks: function(options) {
    var taskRunner = this.getTaskRunner();
    this.ui.write('Running tasks with ' + taskRunner.module + '...\n');
    return taskRunner.run(options);
  },

  run: function(options) {

    process.env.EMBER_ENV = options.environment || 'development';

    return this.runTasks(options)
      .then(function(result) {
        this.ui.write('Tasks complete.\n');
        Promise.resolve(result);
      }.bind(this));
  }
});
