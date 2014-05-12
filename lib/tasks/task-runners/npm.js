'use strict';

var TaskRunner   = require('../../models/task-runner');
var Promise      = require('../../ext/promise');
var exec         = require('child_process').exec;
var requireLocal = require('../../utilities/require-local');

module.exports = TaskRunner.extend({
  module: 'npm',
  run: function(options) {
    var npm = require(this.module);
    var pkg = require(this.project.root + '/package');
    var self = this;

    var taskIndex = 0;

    return new Promise(function(resolve, reject) {
      npm.load(pkg, function(err, npm) {
        if (err) return reject(err);

        var runNextTask = function() {
          var task = options.tasks[taskIndex];
          if (pkg.scripts.hasOwnProperty(task)) {
            npm.commands['run-script']([task], function(err, result) {
              if (err) return reject(err);
              if (++taskIndex < options.tasks.length) {
                return runNextTask();
              } else {
                return resolve();
              }
            });
          } else {
            return reject(new Error('"' + task + '"' +
                                    'was not found in package.scripts.'));
          }
        };

        runNextTask();

      });

    });

  }
});
