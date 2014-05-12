'use strict';

var TaskRunner = require('../../models/task-runner');
var Promise    = require('../../ext/promise');
var exec       = require('child_process').exec;
var npm        = require('npm');

module.exports = TaskRunner.extend({
  module: 'npm',
  run: function(options) {

    var pkg = require(this.project.root + '/package');
    var tasksComplete = 0;
    var self = this;

    return new Promise(function(resolve, reject) {
      var task = options.tasks[0];

      if (pkg.scripts.hasOwnProperty(task)) {

        npm.load(pkg, function(err, npm) {
          if (err) reject(err);
          npm.commands['run-script']([task], function(err, result) {
            resolve()
          });
        });

      } else {
        reject(new Error('"' + task + '" was not found in package.scripts.'))
      }
      
    });

  }
});
