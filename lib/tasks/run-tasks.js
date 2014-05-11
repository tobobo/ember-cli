'use strict';

var Promise          = require('../ext/promise');
var Task             = require('../models/task');
var requireLocal     = require('../utilities/require-local');
var chalk            = require('chalk');
var glob             = require('glob');

module.exports = Task.extend({
  run: function(options) {
    var pkg = require(this.project.root + '/package');
    var deps = pkg['devDependencies'];

    process.env.EMBER_ENV = options.environment || 'development';

    var taskRunners = {
      grunt: function(grunt, options) {
        var gruntfilePattern = this.project.root + '/Gruntfile*';
        return new Promise(function(resolve, reject) {
          glob(gruntfilePattern, function(err, files) {
            if (err) {
              reject(err);
            } else if (files.length === 0) {
              reject(new Error('Your devDependencies specify grunt. ' +
                                'Attempted to run grunt tasks ' +
                                'but no Gruntfile was found.'));
            } else {
              var gruntfile = files[0];
              require(gruntfile)(grunt);
              resolve(gruntfile);
            }
          });
        }).then(function() {
          return new Promise(function(resolve, reject) {
            grunt.task.options({
              error: function(e) { reject(e); },
              done: function() { resolve(); }
            });
            grunt.task.run(options.tasks).start();
          });
        });
      }
    };

    for (var runner in taskRunners) {
      if (deps.hasOwnProperty(runner)) {
        this.ui.write('Running tasks with ' + runner + '...\n');
        return taskRunners[runner].call(this, requireLocal(runner), options);
      }
    }

    this.ui.write('No task runner found. ' +
                  'Install a task runner such as grunt to use ' +
                  chalk.green('ember run') + '.\n');

    return Promise.resolve();
  }
});
