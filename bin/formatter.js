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
const

function parseDate(value) {
  if (/^[+-]?\d*(\.\d*)?$/.test(value)) {
    value = parseInt(value);
  }

  return new Date(value);
}

function files(value) {
  if (!value) return CONST.FILES;

  return value;
}

function output(value) {
  if (!value) return CONST.OUTPUT;

  return (value + '/').replace(/\\+/g, '/');
}

function start(value) {
  return parseDate(value);
}

function end(value) {
  return parseDate(value);
}

function types(value) {
  if (typeOf(value) === 'string') {
    return value.trim().split(/\s*,\s*/);
  }
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
