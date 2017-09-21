/*!
 * validator
 *
 * Version: 0.0.1
 * Date: 2017/05/19
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

  if (value.length) {
    let types = [];

    CONST.FILTER_TYPES.forEach(function(type) {
      if (value.indexOf(type) !== -1) {
        types.push(type);
      }
    });

    return Boolean(types.length);
  }

  return false;
}

function dot(value) {
  return typeOf(value) === 'boolean';
}

module.exports = {
  files,
  output,
  start,
  end,
  types,
  dot
};
