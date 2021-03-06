/**
 * @module index
 * @license MIT
 * @version 2017/09/22
 */

'use strict';

const path = require('path');
const utils = require('./lib/utils');
const CONST = require('./lib/const');
const formatter = require('./lib/formatter');
const validator = require('./lib/validator');
const child_process = require('child_process');

const parseDate = utils.parseDate;
const parseTypes = utils.parseTypes;
const parseIgnore = utils.parseIgnore;
const valueInvalid = utils.valueInvalid;
const yaml = utils.loadYAML(CONST.YAML_SRC) || {};

/**
 * @function assign
 * @description Assign options
 * @param {Object} options
 * @param {string} key
 * @param {any} value
 * @param {string} source
 * @returns {number}
 */
function assign(options, key, value, source) {
  const validate = validator[key];

  switch (key) {
    case 'start':
    case 'end':
      value = options[key] = parseDate(value);
      break;
    case 'types':
      value = options[key] = parseTypes(value);
      break;
    case 'ignore':
      value = options[key] = parseIgnore(value);
  }

  if (!validate(value)) {
    valueInvalid(key, source);

    return 1;
  }

  return 0;
}

/**
 * @function extractor
 * @description Extractor
 * @param {Object} options
 */
function extractor(options) {
  let errors = 0;

  options = options || {};

  CONST.OPTIONS_KEYS.forEach(key => {
    const value = options[key];
    const yamlValue = yaml[key];
    const format = formatter[key];
    const hasOwnKey = options.hasOwnProperty(key);
    const yamlHasOwnKey = yaml.hasOwnProperty(key);

    if (hasOwnKey) {
      errors += assign(options, key, value);
    } else if (yamlHasOwnKey) {
      errors += assign(options, key, yamlValue, CONST.YAML);
    } else {
      options[key] = format(value);
    }

    if (errors) {
      utils.exit(1);
    }
  });

  // Fork thread
  const worker = child_process.fork(path.join(__dirname, 'lib/worker'), { silent: true });

  worker.send({
    status: CONST.STATUS.BOOTSTRAP,
    data: options
  });

  return worker;
}

// Process status
Object.defineProperty(extractor, 'STATUS', {
  writable: false,
  enumerable: true,
  configurable: false,
  value: CONST.STATUS
});

module.exports = extractor;
