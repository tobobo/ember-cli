'use strict';

var glob    = require('glob');
var Promise = require('../../ext/promise');

module.exports = {
  module: 'grunt',
  run: function(grunt, options) {

    var gruntfilePattern = this.project.root + '/Gruntfile*';

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

        grunt.task.options({
          error: function(e) { reject(e); },
          done: function() { resolve(); }
        });

        grunt.task.run(options.tasks)
          .start();

      });

    });

  }
};
