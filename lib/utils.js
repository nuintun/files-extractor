/**
 * @module utils
 * @license MIT
 * @version 2017/09/19
 */

'use strict';

const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const yaml = require('js-yaml');
const CONST = require('./const');
const typeOf = require('./typeof');
const logSymbols = require('log-symbols');

function inspect(value) {
  return typeOf(value) === 'string' ? value : util.inspect(value);
}

/**
 * @function pad
 * @description Pad start string with 0
 * @param {string} value
 * @param {number} length
 * @param {string} pad
 * @returns {string}
 */
const pad = String.prototype.padStart
  ? function(value, length, pad) {
      return String.prototype.padStart.call(String(value), length, pad || '0');
    }
  : function(value, length, pad) {
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
    };

/**
 * @function formatDate
 * @description Format date
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1, 2);
  const day = pad(date.getDate(), 2);
  const hour = pad(date.getHours(), 2);
  const minutes = pad(date.getMinutes(), 2);
  const seconds = pad(date.getSeconds(), 2);

  return `${year}-${month}-${day} ${hour}.${minutes}.${seconds}`;
}

/**
 * @function dest
 * @description Path of dest
 * @param {string} file
 * @param {Object} options
 * @returns {string}
 */
function dest(file, options) {
  return path.resolve(CONST.CWD, options.output, `${formatDate(options.start)} & ${formatDate(options.end)}`, file);
}

/**
 * @function color
 * @description Colored output
 * @param {string} value
 * @param {string} color
 * @param {boolean} substr
 * @param {boolean} bold
 * @returns {string}
 */
function color(value, color, substr, bold) {
  color = color || 'cyan';
  substr = arguments.length < 3 ? true : substr;

  if (substr) {
    const length = value.length;

    if (length >= 33) {
      value = value.substring(0, 15) + '...' + value.substring(length - 15);
    }
  }

  return bold ? chalk.reset.bold[color](value) : chalk.reset[color](value);
}

/**
 * @function loadYAML
 * @description Load yml config
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

    return exit(1);
  }

  return code;
}

/**
 * @function parseDate
 * @param {any} value
 * @returns {Date}
 */
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

/**
 * @function parseTypes
 * @param {any} value
 * @returns {Array}
 */
function parseTypes(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeOf(value) === 'string') {
    value = value.trim().split(/\s*,\s*/);
  }

  return value;
}

/**
 * @function parseIgnore
 * @param {any} value
 * @returns {Array}
 */
function parseIgnore(value) {
  if (!Array.isArray(value)) {
    value = value ? [value] : [];
  }

  return value;
}

/**
 * @function error
 * @param {string} message
 */
function error(message) {
  process.stderr.write(`${logSymbols.error} ${inspect(message)}\n`);
}

/**
 * @function valueInvalid
 * @param {string} key
 * @param {string} source
 */
function valueInvalid(key, source) {
  const ref = source ? ` at ${source}` : '';

  error(`Oops, options.${key} is invalid${ref}!`);
}

/**
 * @function exit
 * @description Fix stdout truncation on windows
 * @param {number} code
 */
function exit(code) {
  if (process.platform === 'win32' && process.stdout.bufferSize) {
    return process.stdout.once('drain', () => process.exit(code));
  }

  process.exit(code);
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
  error,
  valueInvalid,
  exit
};
