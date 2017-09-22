/*!
 * FilesExtractor
 *
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const utils = require('./utils');
const CONST = require('./const');
const typeOf = require('./typeof');
const validator = require('./validator');

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
  value = utils.parseDate(value);

  if (validator.start(value)) {
    return value;
  }

  throw new TypeError('The value of start date is illegal.');
}

function end(value) {
  value = utils.parseDate(value);

  if (validator.end(value)) {
    return value;
  }

  return new Date();
}

function types(value) {
  value = utils.parseTypes(value);

  if (validator.types(value)) {
    return value;
  }

  return CONST.FILTER_TYPES;
}

function dot(value) {
  return Boolean(value);
}

function ignore(value) {
  if (!Array.isArray(value)) {
    value = value ? [value] : [];
  }

  return value;
}

module.exports = {
  files,
  output,
  start,
  end,
  types,
  dot,
  ignore
};
