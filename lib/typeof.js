/*!
 * typeof
 *
 * Date: 2017/09/21
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const EXTRACTTYPE_RE = /\[object (.+)\]/;
const toString = Object.prototype.toString;

/**
 * type
 *
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
