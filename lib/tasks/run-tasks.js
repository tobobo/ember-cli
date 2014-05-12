'use strict';

var Promise       = require('../ext/promise');
var Task          = require('../models/task');
var requireAsHash = require('../utilities/require-as-hash');
var taskRunners   = requireAsHash('task-runners/*.js');

module.exports = Task.extend({

  createTaskRunner: function(Runner, options) {
    return new Runner({
      project: this.project,
      tasks: options.tasks,
      ui: this.ui,
      analytics: this.analytics
    });
  },

  getTaskRunner: function(options) {
    var pkg = require(this.project.root + '/package');
    var deps = pkg['devDependencies'];

    for (var runner in taskRunners) {

      var taskRunner = this.createTaskRunner(taskRunners[runner], options);

      if (
        (!options.runner &&
        taskRunner.module !== 'npm' &&
        deps.hasOwnProperty(taskRunner.module)) ||
        (taskRunner.module === options.runner)) {
        return taskRunner;
      }
    }

    return this.createTaskRunner(taskRunners.Npm, options);

  },

  runTasks: function(options) {
    var taskRunner = this.getTaskRunner(options);
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
