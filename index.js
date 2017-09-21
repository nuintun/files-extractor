/*!
 * index
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const ora = require('ora');
const glob = require('glob');
const path = require('path');
const fs = require('fs-extra')
const chalk = require('chalk');
const yaml = require('js-yaml');
const cluster = require('cluster');
const utils = require('./lib/utils');
const async = require('./lib/async');
const ProgressBar = require('progress');
const spinners = require('cli-spinners');

const CWD = utils.CWD;
const YAML = 'fextract.yml';
const YAMLFILE = path.join(CWD, YAML);

/**
 * Colored output
 *
 * @param {String} value
 * @param {String} color
 * @param {Boolean} substr
 * @returns {String}
 */
function color(value, color, substr) {
  if (substr !== false) {
    let length = value.length;

    if (length >= 33) {
      value = value.substring(0, 15) + '...' + value.substring(length - 15);
    }
  }

  return chalk.reset.bold[color || 'cyan'](value);
}

/**
 * Filter files by stat time
 *
 * @param {Array} files
 * @param {Object} options
 * @returns {Boolean}
 */
function filter(files, options) {
  return files.filter(function(file) {
    let stat;

    process.send({
      status: STATUS.FILTERING,
      data: file
    });

    try {
      stat = fs.statSync(path.join(CWD, file));
    } catch (error) {
      return false;
    }

    let time = stat[options.type];

    return time >= options.start && time <= options.end;
  });
}

/**
 * Pad start string with 0
 *
 * @param {String|Number} value
 * @param {Number} length
 * @returns {String}
 */
function padStart(value, length) {
  return utils.padStart(value, length, '0');
}

/**
 * Format date
 *
 * @param {Date} date
 * @returns {String}
 */
function formatDate(date) {
  let year = date.getFullYear();
  let month = padStart(date.getMonth() + 1, 2);
  let day = padStart(date.getDate(), 2);
  let hour = padStart(date.getHours(), 2);
  let minutes = padStart(date.getMinutes(), 2);
  let seconds = padStart(date.getSeconds(), 2);

  return `${ year }-${ month }-${ day } ${ hour }.${ minutes }.${ seconds }`;
}

/**
 * Path of dest
 *
 * @param {String} file
 * @param {Object} options
 * @returns {String}
 */
function dest(file, options) {
  return path.resolve(CWD, options.output, `${ formatDate(options.start) } & ${ formatDate(options.end) }`, file);
}

/**
 * FilesExtractor
 *
 * @param {Object} options
 * @constructor
 */
function FilesExtractor(options) {
  let ignore = options.ignore;
  let output = options.output;

  ignore.push(output + '**/*', YAML);

  this.options = options;
}

/**
 * Load yml config
 *
 * @returns {Object|undefined}
 */
FilesExtractor.loadYAML = function() {
  let code;

  try {
    // Read source file
    code = fs.readFileSync(YAMLFILE);
  } catch (error) {
    // No permissions or other read errors
  }

  // Parse yaml
  return code && yaml.safeLoad(code, { filename: YAMLFILE });
}

const STATUS = {
  FAILED: 0,
  WARNING: 1,
  SEARCHING: 2,
  FILTERING: 3,
  FILTERED: 4,
  EXTRACTING: 5,
  EXTRACTED: 6
};
const starting = color('Starting...', 'green');
const searching = color('Searching', 'green');
const filtering = color('Filtering', 'green');
const extracting = color('Extracting', 'green');
const fmt = `${ extracting }: [:bar] (:current/:total) :percent - :file`;

FilesExtractor.prototype = {
  spinner: function() {
    return this.load = ora({
      stream: process.stdout,
      spinner: spinners.line
    }).start(starting);
  },
  bar: function(total) {
    return this.progress = new ProgressBar(fmt, {
      width: 30,
      clear: true,
      total: total,
      stream: process.stdout,
      head: '>'
    });
  },
  UI: function(message) {
    let context = this;
    let data = message.data;
    let load = context.load;
    let progress = context.progress;

    switch (message.status) {
      case STATUS.FAILED:
        load.fail(data.message);

        process.exit();
        break;
      case STATUS.WARNING:
        progress.interrupt(`${ extracting }: ${ data.syscall } ${ color(data.file, 'red') } ${ data.code }!`);
        break;
      case STATUS.SEARCHING:
        load.text = `${ searching }: ${ color(data) }`;
        break;
      case STATUS.FILTERING:
        load.text = `${ filtering }: ${ color(data) }`;
        break;
      case STATUS.FILTERED:
        load.stop();
        context.bar(data);
        break;
      case STATUS.EXTRACTING:
        progress.tick({
          file: color(data)
        });
        break;
      case STATUS.EXTRACTED:
        progress.terminate();
        process.stdout.write(color(data, 'green', false));
        process.exit();
        break;
    }
  },
  extract: function() {
    let context = this;
    let options = context.options;

    if (cluster.isMaster) {
      cluster.setupMaster({
        silent: true
      });

      context.spinner();

      let worker = cluster.fork();

      // Listen event
      worker.on('message', context.UI.bind(context));
    } else {
      glob(options.files, { root: CWD, dot: options.dot, nodir: true, ignore: options.ignore }, function(error, files) {
        if (error) {
          return process.send({
            status: STATUS.FAILED,
            data: error
          });
        }

        files = filter(files, options);

        let length = files.length;

        process.send({
          status: STATUS.FILTERED,
          data: length
        });

        async.series(files, function(file, next) {
          fs.copy(file, dest(file, options), { preserveTimestamps: true }, function(error) {
            process.send({
              status: STATUS.EXTRACTING,
              data: file
            });

            if (error) {
              let syscall = error.syscall || 'extract';
              let code = error.code || 'failed';

              process.send({
                status: STATUS.WARNING,
                data: { syscall, file, code }
              });
            }

            next();
          });
        }, function() {
          let message = length
            ? 'Oh yeah, extract the matched files successfully!'
            : 'Oops, there is no files matched the condition!';

          process.send({
            status: STATUS.EXTRACTED,
            data: message
          });

          process.exit();
        });
      }).on('match', function(file) {
        process.send({
          status: STATUS.SEARCHING,
          data: file
        });
      });
    }

    return context;
  }
};

module.exports = FilesExtractor;
