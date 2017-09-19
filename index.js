/*!
 * index
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const glob = require('glob');
const path = require('path');
const fs = require('fs-extra')
const yaml = require('js-yaml');
const colors = require('colors');
const utils = require('./lib/utils');
const async = require('./lib/async');
const ProgressBar = require('progress');

const CWD = utils.CWD;
const YAMLFILE = path.join(CWD, 'fextract.yml');

function filter(files, options) {
  return files.filter(function(file) {
    try {
      let stat = fs.statSync(path.join(CWD, file));
      let time = stat[options.type];

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
  let year = date.getFullYear();
  let month = padStart(date.getMonth() + 1, 2);
  let day = padStart(date.getDate(), 2);
  let hour = padStart(date.getHours(), 2);
  let minutes = padStart(date.getMinutes(), 2);
  let seconds = padStart(date.getSeconds(), 2);
  let millisecond = padStart(date.getMilliseconds(), 3);

  return `${ year }${ month }${ day }${ hour }${ minutes }${ seconds }${ millisecond }`;
}

function dest(file, options) {
  return path.join(CWD, options.output, `${ formatDate(options.start) } - ${ formatDate(options.end) }`, file);
}

function FilesExtractor(options) {
  this.options = options;
}

FilesExtractor.loadYAML = function() {
  let ini = {};

  // File config
  if (fs.pathExistsSync(YAMLFILE)) {
    // Parse yaml
    let source = fs.readFileSync(YAMLFILE);

    ini = yaml.safeLoad(source, { filename: YAMLFILE });
  }

  return ini;
}

FilesExtractor.prototype = {
  extract: function() {
    let options = this.options;

    glob(options.files, { root: CWD, dot: options.dot, nodir: true, ignore: options.ignore }, function(error, files) {
      if (error) {
        return process.stderr.write(error);
      }

      files = filter(files, options);

      let extracting = colors.reset.green.bold('Extracting');
      let fmt = `${ extracting }: [:bar] (:current/:total) :percent - :file`;
      let bar = new ProgressBar(fmt, { width: 30, clear: true, total: files.length, stream: process.stdout, head: '>' });

      async.series(files, function(file, next) {
        fs.copy(file, dest(file, options), { preserveTimestamps: true }, function(error) {
          bar.tick({ file: colors.reset.cyan.bold(file) });

          if (error) {
            let syscall = error.syscall || 'extract';
            let code = error.code || 'failed';

            bar.interrupt(`${ extracting }: ${ syscall } ${ colors.reset.red.bold(file) } ${ code }!`);
          }

          next();
        });
      }, function() {
        let message = files.length ? 'Oh yeah, extract the matched files successfully!' : 'Oops, there is no files matched the condition!';

        process.stdout.write(colors.reset.green.bold(message));
        process.exit();
      });
    });

    return this;
  }
};

module.exports = FilesExtractor;
