/*!
 * index
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

var glob = require('glob');
var path = require('path');
var fs = require('fs-extra')
var yaml = require('js-yaml');
var colors = require('colors');
var utils = require('./lib/utils');
var async = require('./lib/async');
var ProgressBar = require('progress');

var CWD = utils.CWD;
var YAMLFILE = path.join(CWD, 'fextract.yml');

function filter(files, options) {
  return files.filter(function(file) {
    try {
      var stat = fs.statSync(path.join(CWD, file));
      var time = stat[options.type];

      return time >= options.start && time <= options.end;
    } catch (error) {
      return false;
    }
  });
}

function padStart(value, length) {
  return utils.padStart(value, length, '0');
}

function formatDate(date) {
  var year = date.getFullYear();
  var month = padStart(date.getMonth() + 1, 2);
  var day = padStart(date.getDate(), 2);
  var hour = padStart(date.getHours(), 2);
  var minutes = padStart(date.getMinutes(), 2);
  var seconds = padStart(date.getSeconds(), 2);
  var millisecond = padStart(date.getMilliseconds(), 3);

  return `${ year }${ month }${ day }${ hour }${ minutes }${ seconds }${ millisecond }`;
}

function dest(file, options) {
  return path.join(CWD, options.output, `${ formatDate(options.start) } - ${ formatDate(options.end) }`, file);
}

function FilesExtractor(options) {
  this.options = options;
}

FilesExtractor.loadYAML = function() {
  var ini = {};

  // File config
  if (fs.pathExistsSync(YAMLFILE)) {
    // Parse yaml
    var source = fs.readFileSync(YAMLFILE);

    ini = yaml.safeLoad(source, { filename: YAMLFILE });
  }

  return ini;
}

FilesExtractor.prototype = {
  extract: function() {
    var options = this.options;

    glob(options.files, { root: CWD, dot: options.dot, nodir: true, ignore: options.ignore }, function(error, files) {
      if (error) {
        return process.stderr.write(error);
      }

      files = filter(files, options);

      var bar = new ProgressBar(
        `${ colors.reset.green.bold('Extracting') }: [:bar] (:current/:total) :percent - :file`, {
          width: 30,
          clear: true,
          total: files.length,
          stream: process.stdout
        }
      );

      async.series(files, function(file, next) {
        fs.copy(file, dest(file, options), { preserveTimestamps: true }, function(error) {
          if (error) {
            bar.interrupt(`${ colors.reset.green.bold('Extracting') }: ${ colors.reset.red.bold(file) } failed!`);
          }

          bar.tick({
            file: colors.reset.cyan.bold(file)
          });

          next();
        });
      }, function() {
        process.stdout.write(colors.reset.green.bold('Oh yeah, extract files successfully!'));
        process.exit();
      });
    });

    return this;
  }
};

module.exports = FilesExtractor;
