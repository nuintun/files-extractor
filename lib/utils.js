/*!
 * utils
 *
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const yaml = require('js-yaml');
const CONST = require('./const');
const typeOf = require('./typeof');

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

  return chalk.reset.bold[color || 'cyan'](value);
}

/**
 * Load yml config
 *
 * @returns {Object|undefined}
 */
function loadYAML(src) {
  let code;

  try {
    // Read source file
    code = fs.readFileSync(src);
  } catch (error) {
    // No permissions or other read errors
  }

  // Parse yaml
  return code && yaml.safeLoad(code, { filename: src });
};

function parseDate(value) {
  if (typeOf(value) === 'string') {
    if (/^[+-]?\d*(\.\d*)?$/.test(value)) {
      value = parseInt(value);
    }
  }

  return new Date(value);
}

function parseTypes(value) {
  if (typeOf(value) === 'string') {
    value = value.trim().split(/\s*,\s*/);
  }

  return value;
}

const WARNING = chalk.reset.bold.yellow('‼');

function warning(message) {
  process.stderr.write(`${ WARNING } ${ message }\n`);
}

const ERROR = chalk.reset.bold.red('×');

function error(message) {
  process.stderr.write(`${ ERROR } ${ message }\n`);
}

module.exports = {
  pad,
  dest,
  color,
  loadYAML,
  parseDate,
  parseTypes,
  warning,
  error,
};
