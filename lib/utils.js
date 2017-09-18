'use strict';

function dateIsValid(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
  dateIsValid: dateIsValid
};
