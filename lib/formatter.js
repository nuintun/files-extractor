/**
 * @module formatter
 * @license MIT
 * @version 2017/09/19
 */

'use strict';

const utils = require('./utils');
const CONST = require('./const');
const validator = require('./validator');

/**
 * @function files
 * @param {any} value
 * @returns {string}
 */
function files(value) {
  if (validator.files(value)) {
    return value;
  }

  return CONST.FILES;
}

/**
 * @function output
 * @param {any} value
 * @returns {string}
 */
function output(value) {
  if (validator.output(value)) {
    return (value + '/').replace(/\\+/g, '/');
  }

  return CONST.OUTPUT;
}

/**
 * @function start
 * @param {any} value
 * @returns {string}
 */
function start(value) {
  value = utils.parseDate(value);

  if (validator.start(value)) {
    return value;
  }

  utils.error('Oops, options.start is required!');
  utils.exit(1);
}

/**
 * @function end
 * @param {any} value
 * @returns {string}
 */
function end(value) {
  value = utils.parseDate(value);

  if (validator.end(value)) {
    return value;
  }

  return new Date();
}

/**
 * @function types
 * @param {any} value
 * @returns {Array}
 */
function types(value) {
  value = utils.parseTypes(value);

  if (validator.types(value)) {
    return value;
  }

  return CONST.FILTER_TYPES;
}

/**
 * @function dot
 * @param {any} value
 * @returns {boolean}
 */
function dot(value) {
  return Boolean(value);
}

/**
 * @function ignore
 * @param {any} value
 * @returns {Array}
 */
function ignore(value) {
  value = utils.parseIgnore(value);

  if (validator.ignore(value)) {
    return value;
  }

  return [];
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
