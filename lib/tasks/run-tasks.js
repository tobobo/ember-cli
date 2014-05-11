'use strict';

var Promise          = require('../ext/promise');
var Task             = require('../models/task');
var requireLocal     = require('../utilities/require-local');
var chalk            = require('chalk');
var requireAsHash    = require('../utilities/require-as-hash');
var taskRunners      = requireAsHash('task-runners/*.js');

module.exports = Task.extend({

  getTaskRunner: function() {
    var pkg = require(this.project.root + '/package');
    var deps = pkg['devDependencies'];
    for (var runner in taskRunners) {
      if (deps.hasOwnProperty(taskRunners[runner].module)) {
        return taskRunners[runner];
      }
    }
  },

  runTasks: function(options) {
    var taskRunner = this.getTaskRunner();
    if (taskRunner) {
      this.ui.write('Running tasks with ' + taskRunner.module + '...\n');
      return taskRunner.run.call(this, requireLocal(taskRunner.module), options);
    } else {
      return Promise.reject('No task runner found. ' +
                            'Install a task runner such as grunt to use ' +
                            chalk.green('ember run') + '.\n');
    }
  },

  run: function(options) {

    process.env.EMBER_ENV = options.environment || 'development';

    return this.runTasks(options)
      .then(function(result) {
        this.ui.write('Tasks completed.\n');
        Promise.resolve(result);
      }.bind(this));
  }
});
