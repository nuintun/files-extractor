/*!
 * utils
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const toString = Object.prototype.toString;

/**
 * Pad start string
 *
 * @param {String} value
 * @param {Number} length
 * @param {String} pad
 * @returns {String}
 */
const padStart = String.prototype.padStart ? function(value, length, pad) {
  return String.prototype.padStart.call(value, length, pad);
} : function(value, length, pad) {
  value = String(value);
  length = length >> 0;
  pad = String(pad || ' ');

  if (value.length > length) {
    return String(value);
  } else {
    length = length - value.length;

    if (length > pad.length) {
      pad += pad.repeat(length / pad.length);
    }

    return pad.slice(0, length) + String(value);
  }
}

/**
 * Is string
 *
 * @param {Any} value
 * @returns {Boolean}
 */
function isString(value) {
  return toString.call(value) === '[object String]';
}

/**
 * Date is valid
 *
 * @param {Date} date
 */
function dateIsValid(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
  CWD: process.cwd(),
  padStart: padStart,
  dateIsValid: dateIsValid,
  isString: isString
};
