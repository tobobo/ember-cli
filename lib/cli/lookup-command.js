'use strict';
var chalk = require('chalk');
var Command = require('../models/command');

var UnknownCommand = Command.extend({
  validateAndRun: function() {
    this.ui.write('The specified command ' + chalk.green(this.commandName) +
                  ' is invalid, for available options see ' +
                  chalk.green('ember help') + '.\n');
  }
});


module.exports = function(commands, commandName){
  function aliasMatches(alias) {
    return alias === commandName;
  }

  for (var key in commands) {
    var command = commands[key];

    var name = command.prototype.name;
    var aliases = command.prototype.aliases || [];

    if (name === commandName || aliases.some(aliasMatches)) {
      return command;
    }
  }

  var runKey = 'Run';
  if (runKey in commands) {
    var runCommand = commands[runKey];
    runCommand.prototype._run = runCommand.prototype.run;
    runCommand.prototype.run = function(commandName) {
      return function(options, rawArgs) {
        rawArgs.unshift(commandName);
        return this._run.apply(this, arguments);
      };
    }(commandName);
    return runCommand;
  }

  // if we didn't find anything, return an "UnknownCommand"
  return UnknownCommand.extend({
    commandName: commandName
  });
};
