/**
 * @module fextract
 * @license MIT
 * @version 2017/09/19
 */

'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const CONST = require('./const');
const dest = require('./utils').dest;

const CWD = CONST.CWD;
const YAML = CONST.YAML;
const STATUS = CONST.STATUS;

/**
 * @function filter
 * @description Filter files by stat time
 * @param {Array} files
 * @param {Object} options
 * @returns {boolean}
 */
function filter(files, options) {
  return files.filter(file => {
    process.send({
      status: STATUS.FILTERING,
      data: file
    });

    let stat;

    try {
      stat = fs.statSync(path.join(CWD, file));
    } catch (error) {
      return false;
    }

    if (!stat.isFile()) return false;

    const types = options.types;
    const length = types.length;
    const start = options.start;
    const end = options.end;

    for (let i = 0; i < length; i++) {
      const type = types[i];
      const time = stat[type];

      if (time >= start && time <= end) {
        return true;
      }
    }

    return false;
  });
}

/**
 * @class FilesExtractor
 */
class FilesExtractor {
  /**
   * @constructor
   * @param {Object} options
   */
  constructor(options) {
    options.start = new Date(options.start);
    options.end = new Date(options.end);

    options.ignore.push(YAML, options.output + '**/*');

    this.options = options;

    process.send({
      status: STATUS.BOOTSTRAP,
      data: options
    });

    this.extract();
  }

  /**
   * @method extract
   */
  extract() {
    const options = this.options;

    glob(
      options.files,
      {
        root: CWD,
        nodir: true,
        dot: options.dot,
        ignore: options.ignore
      },
      (error, files) => {
        if (error) {
          return process.send({
            status: STATUS.FAILED,
            data: error.message
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

        let copied = 0;
        const count = files.length;

        // Check completed
        const completed = () => {
          if (++copied >= count) {
            const message = count
              ? 'Great, the matched files extract successfully!'
              : 'Oops, there is no matched files!';

            process.send({
              status: STATUS.EXTRACTED,
              data: message
            });
          }
        };

        files.forEach(file => {
          fs
            .copy(file, dest(file, options))
            .then(() => {
              process.send({
                status: STATUS.EXTRACTING,
                data: file
              });

              completed();
            })
            .catch(error => {
              const code = error.code || 'failed';
              const syscall = error.syscall || 'extract';

              process.send({
                status: STATUS.WARNING,
                data: { code, syscall, file }
              });

              completed();
            });
        });
      }
    ).on('match', file => {
      process.send({
        status: STATUS.SEARCHING,
        data: file
      });
    });
  }
}

module.exports = FilesExtractor;
