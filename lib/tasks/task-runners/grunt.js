'use strict';

var glob             = require('glob');
var Promise          = require('../../ext/promise');
var requireLocal     = require('../../utilities/require-local');
var TaskRunner       = require('../../models/task-runner');

module.exports = TaskRunner.extend({
  module: 'grunt',
  run: function(options) {
    var grunt = requireLocal(this.module);
    var gruntfilePattern = this.project.root + '/Gruntfile*';
    var self = this;
    return new Promise(function(resolve, reject) {

      glob(gruntfilePattern, function(err, files) {

        if (err) {
          reject(err);
        } else if (files.length === 0) {
          reject(new Error('Your devDependencies specify grunt ' +
                            'but no Gruntfile was found.'));
        } else {
          var gruntfile = files[0];
          require(gruntfile)(grunt);
          resolve(gruntfile);
        }

      });

    }).then(function() {

      return new Promise(function(resolve, reject) {

        grunt.registerTask(
          'ember:build',
          'Build the Ember app.',
          function(environment) {
            options = grunt.config.get('ember.build');
            if (!environment) environment = 'development';
            var outputPath = grunt.config.get(
                'ember.build.' + environment + '.outputPath'
              ) ||
              grunt.config.get('ember.build.outputPath') ||
              'dist'
            var done = this.async();
            var BuildTask = self.tasks.Build;
            var buildTask = new BuildTask({
              ui: self.ui,
              analytics: self.analytics
            });
            buildTask.run({environment: environment, outputPath: outputPath})
              .then(function() {
                done();
              });
          }
        );

        grunt.task.options({
          error: function(e) { reject(e); },
          done: function() { resolve(); }
        });

        grunt.task.run(options.tasks)
          .start();

      });

    });

  }
});
