/*!
 * validator
 *
 * Version: 0.0.1
 * Date: 2017/9/21
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const CONST = require('./const');
const typeOf = require('./typeof');

/**
 * Is a valid Date
 *
 * @param {Any} value
 * @param {Boolean}
 * @returns {Boolean}
 */
function isValidDate(value) {
  return typeOf(value) === 'date' && !isNaN(value.getTime());
}

/**
 * Is a string
 *
 * @param {Any} value
 * @param {Boolean}
 * @returns {Boolean}
 */
function isString(value) {
  return typeOf(value) === 'string';
}

function files(value) {
  return value && isString(value);
}

function output(value) {
  return value && isString(value);
}

function start(value) {
  return isValidDate(value);
}

function end(value) {
  return isValidDate(value);
}

function types(value) {
  if (!Array.isArray(value)) return false;

  let length = value.length;

  if (!length || length > 4) return false;

  for (let i = 0; i < length; i++) {
    if (CONST.FILTER_TYPES.indexOf(value[i]) === -1) {
      return false
    }
  }

  return true;
}

function dot(value) {
  return typeOf(value) === 'boolean';
}

function ignore(value) {
  if (!Array.isArray(value)) return false;

  let length = value.length;

  for (let i = 0; i < length; i++) {
    if (typeOf(value[i]) !== 'string') {
      return false;
    }
  }

  return true;
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
