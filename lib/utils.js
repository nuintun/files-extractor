/*!
 * utils
 *
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const yaml = require('js-yaml');
const CONST = require('./const');
const typeOf = require('./typeof');
const validator = require('./validator');

function inspect(value) {
  return typeOf(value) === 'string' ? value : util.inspect(value);
}

/**
 * Pad start string with 0
 *
 * @param {String} value
 * @param {Number} length
 * @param {String} pad
 * @returns {String}
 */
const pad = String.prototype.padStart ? function(value, length, pad) {
  return String.prototype.padStart.call(String(value), length, pad || '0');
} : function(value, length, pad) {
  value = String(value);
  length = length >> 0;
  pad = par || '0';

  if (value.length > length) {
    return value;
  } else {
    length = length - value.length;

    if (length > pad.length) {
      pad += pad.repeat(length / pad.length);
    }

    return pad.slice(0, length) + value;
  }
}

/**
 * Format date
 *
 * @param {Date} date
 * @returns {String}
 */
function formatDate(date) {
  let year = date.getFullYear();
  let month = pad(date.getMonth() + 1, 2);
  let day = pad(date.getDate(), 2);
  let hour = pad(date.getHours(), 2);
  let minutes = pad(date.getMinutes(), 2);
  let seconds = pad(date.getSeconds(), 2);

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
  return path.resolve(
    CONST.CWD, options.output,
    `${ formatDate(options.start) } & ${ formatDate(options.end) }`,
    file
  );
}

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

  return chalk.reset[color || 'cyan'](value);
}

/**
 * Load yml config
 *
 * @returns {Object|undefined}
 */
function loadYAML(src) {
  let code;

  // Read source file
  try {
    code = fs.readFileSync(src);
  } catch (exception) {
    // No permissions or other read errors
    return code;
  }

  // Parse yaml
  try {
    code = yaml.safeLoad(code, { filename: src });
  } catch (exception) {
    error(exception.message);

    return process.exit();
  }

  if (code) {
    let errors = 0;

    CONST.OPTIONS_KEYS.forEach(function(key) {
      if (code.hasOwnProperty(key)) {
        let value = code[key];
        let validate = validator[key];

        switch (key) {
          case 'start':
          case 'end':
            value = parseDate(value);
            code[key] = value;
            break;
          case 'types':
            value = parseTypes(value);
            code[key] = value;
            break;
        }

        if (!validate(value)) {
          errors++;

          error(`Option ${ key }'s value is invalid in ${ CONST.YAML }!`);
        }
      }
    });

    if (errors) {
      return process.exit();
    }
  }

  return code;
};

function parseDate(value) {
  if (typeOf(value) === 'date') {
    return value;
  }

  if (typeOf(value) === 'string') {
    if (/^[+-]?\d*(\.\d*)?$/.test(value)) {
      value = parseInt(value);
    }
  }

  return new Date(value);
}

function parseTypes(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeOf(value) === 'string') {
    value = value.trim().split(/\s*,\s*/);
  }

  return value;
}

const ERROR_SYMBOL = chalk.reset.red('×');
const WARNING_SYMBOL = chalk.reset.yellow('‼');

function error(message) {
  process.stderr.write(`${ ERROR_SYMBOL } ${ inspect(message) }\n`);
}

module.exports = {
  inspect,
  pad,
  dest,
  color,
  loadYAML,
  parseDate,
  parseTypes,
  ERROR_SYMBOL,
  WARNING_SYMBOL,
  error
};
