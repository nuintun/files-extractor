/*!
 * utils
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

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

function dateIsValid(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
  CWD: process.cwd(),
  padStart: padStart,
  dateIsValid: dateIsValid
};
