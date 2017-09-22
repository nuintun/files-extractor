/*!
 * FilesExtractor
 *
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs-extra')
const CONST = require('./const');
const async = require('./async');
const dest = require('./utils').dest;

const CWD = CONST.CWD;
const YAML = CONST.YAML;
const STATUS = CONST.STATUS;

/**
 * Filter files by stat time
 *
 * @param {Array} files
 * @param {Object} options
 * @returns {Boolean}
 */
function filter(files, options) {
  return files.filter(function(file) {
    process.send({
      status: STATUS.FILTERING,
      data: file
    });

    let stat;

    try {
      stat = fs.statSync(path.join(CWD, file));
    } catch (exception) {
      return false;
    }

    if (!stat.isFile()) return false;

    let types = options.types;
    let length = types.length;
    let start = options.start;
    let end = options.end;

    for (let i = 0; i < length; i++) {
      let type = types[i];
      let time = stat[type];

      if (time >= start && time <= end) {
        return true;
      }
    }

    return false;
  });
}

/**
 * FilesExtractor
 *
 * @param {Object} options
 * @constructor
 */
function FilesExtractor(options) {
  let context = this;

  options.start = new Date(options.start);
  options.end = new Date(options.end);

  options.ignore.push(YAML, options.output + '**/*');

  context.options = options;

  process.send({
    status: STATUS.BOOTSTRAP,
    data: options
  });

  return context.extract();
}

const cluster = require('cluster');

FilesExtractor.prototype = {
  extract: function() {
    let context = this;
    let options = context.options;

    glob(options.files, {
      root: CWD,
      dot: options.dot,
      nodir: true,
      ignore: options.ignore
    }, function(exception, files) {
      if (exception) {
        return process.send({
          status: STATUS.FAILED,
          data: exception.message
        });
      }

      process.send({
        status: STATUS.SEARCHED,
        data: files
      });

      files = filter(files, options);

      process.send({
        status: STATUS.FILTERED,
        data: files
      });

      async.series(files, function(file, next) {
        fs.copy(file, dest(file, options), {
          preserveTimestamps: true
        }, function(exception) {
          process.send({
            status: STATUS.EXTRACTING,
            data: file
          });

          if (exception) {
            let syscall = exception.syscall || 'extract';
            let code = exception.code || 'failed';

            process.send({
              status: STATUS.WARNING,
              data: { syscall, file, code }
            });
          }

          next();
        });
      }, function() {
        let message = files.length
          ? 'Great, the matched files extract successfully!'
          : 'Oops, there is no matched files!';

        process.send({
          status: STATUS.EXTRACTED,
          data: message
        }, process.exit);
      });
    }).on('match', function(file) {
      process.send({
        status: STATUS.SEARCHING,
        data: file
      });
    });

    return context;
  }
};

module.exports = FilesExtractor;