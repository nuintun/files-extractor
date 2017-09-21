/*!
 * FilesExtractor
 *
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const CONST = require('./const');
const typeOf = require('./typeof');
const validator = require('./validator');

function parseDate(value) {
  if (typeOf(value) === 'string') {
    if (/^[+-]?\d*(\.\d*)?$/.test(value)) {
      value = parseInt(value);
    }
  }

  return new Date(value);
}

function files(value) {
  if (validator.files(value)) {
    return value;
  }

  return CONST.FILES;
}

function output(value) {
  if (validator.output(value)) {
    return (value + '/').replace(/\\+/g, '/');
  }

  return CONST.OUTPUT;
}

function start(value) {
  value = parseDate(value);

  if (validator.start(value)) {
    return value;
  }

  throw new TypeError('The value of start date is illegal.');
}

function end(value) {
  value = parseDate(value);

  if (validator.end(value)) {
    return value;
  }

  return new Date();
}

function types(value) {
  if (typeOf(value) === 'string') {
    value = value.trim().split(/\s*,\s*/);
  }

  if (validator.types(value)) {
    return value;
  }

  return CONST.FILTER_TYPES;
}

function dot(value) {
  return Boolean(value);
}

module.exports = {
  files,
  output,
  start,
  end,
  types,
  dot
};
