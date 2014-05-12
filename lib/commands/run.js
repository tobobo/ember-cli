'use strict';

var Command = require('../models/command');
var chalk   = require('chalk');

module.exports = Command.extend({
  name: 'run',
  aliases: ['r'],
  description: 'Run tasks using a task runner. ' +
               'Currently supports grunt and npm run-script.',

  availableOptions: [
    { name: 'npm', type: Boolean, default: false },
    { name: 'grunt', type: Boolean, default: false }
  ],

  run: function(options, rawArgs) {

    while (rawArgs[0].substr(0,2) === '--') {
      rawArgs.shift();
    }

    for (var opt in options) {
      if (options[opt]) {
        options.runner = opt;
        break;
      }
    }

    options.tasks = rawArgs;
    options.cliTasks = this.tasks;

    var RunTasks = this.tasks.RunTasks;
    var tasks = new RunTasks({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return tasks.run(options);
  },

  usageInstructions: function() {
    this.ui.write('ember ' + this.name + ' ' +
                  chalk.cyan('[--task-runner] ') +
                  chalk.yellow('<task 1> <task 2>...\n') +
                  '  ' + this.description + '\n'
                );
    return '';
  }
});
