/**
 * @module typeof
 * @license MIT
 * @version 2017/09/21
 */

'use strict';

const EXTRACTTYPE_RE = /\[object (.+)\]/;
const toString = Object.prototype.toString;

/**
 * @function type
 * @param value
 * @returns {String}
 */
function typeOf(value) {
  // Get real type
  let type = toString.call(value).toLowerCase();

  type = type.replace(EXTRACTTYPE_RE, '$1').toLowerCase();

  // Is nan and infinity
  if (type === 'number') {
    // Is nan
    if (value !== value) {
      return 'nan';
    }

    // Is infinity
    if (value === Infinity || value === -Infinity) {
      return 'infinity';
    }
  }

  // Return type
  return type;
}

module.exports = typeOf;
