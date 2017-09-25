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
  pad = pad || '0';

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
 * @param {Boolean} bold
 * @returns {String}
 */
function color(value, color, substr, bold) {
  color = color || 'cyan';
  substr = arguments.length < 3 ? true : substr;

  if (substr) {
    let length = value.length;

    if (length >= 33) {
      value = value.substring(0, 15) + '...' + value.substring(length - 15);
    }
  }

  return bold ? chalk.reset.bold[color](value) : chalk.reset[color](value);
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

  return code;
};

function parseDate(value) {
  switch (typeOf(value)) {
    case 'string':
      if (/^[+-]?\d+$/.test(value)) {
        value = parseInt(value);
      }
    case 'number':
      value = new Date(value);
  }

  return value;
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

function parseIgnore(value) {
  if (!Array.isArray(value)) {
    value = value ? [value] : [];
  }

  return value;
}

const ERROR_SYMBOL = color('×', 'red', false);
const WARNING_SYMBOL = color('‼', 'yellow', false);

function error(message) {
  process.stderr.write(`${ ERROR_SYMBOL } ${ inspect(message) }\n`);
}

function valueInvalid(key, source) {
  let ref = source ? ` at ${ source }` : '';

  error(`Oops, options.${ key } is invalid${ ref }!`);
}

module.exports = {
  inspect,
  pad,
  dest,
  color,
  loadYAML,
  parseDate,
  parseTypes,
  parseIgnore,
  ERROR_SYMBOL,
  WARNING_SYMBOL,
  error,
  valueInvalid
};
