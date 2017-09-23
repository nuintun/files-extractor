/*!
 * index
 * Version: 0.0.1
 * Date: 2017/09/22
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const utils = require('./lib/utils');
const CONST = require('./lib/const');
const formatter = require('./lib/formatter');
const validator = require('./lib/validator');
const child_process = require('child_process');

const parseDate = utils.parseDate;
const parseTypes = utils.parseTypes;
const parseIgnore = utils.parseIgnore;
const valueInvalid = utils.valueInvalid;

let yaml = utils.loadYAML(CONST.YAML_SRC) || {};

function assign(options, key, value, source) {
  let validate = validator[key];

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

function extractor(options) {
  let errors = 0;

  options = options || {};

  CONST.OPTIONS_KEYS.forEach(function(key) {
    let value = options[key];
    let yamlValue = yaml[key];
    let format = formatter[key];
    let hasOwnKey = options.hasOwnProperty(key);
    let yamlHasOwnKey = yaml.hasOwnProperty(key);

    if (hasOwnKey) {
      errors += assign(options, key, value);
    } else if (yamlHasOwnKey) {
      errors += assign(options, key, yamlValue, CONST.YAML);
    } else {
      options[key] = format(value);
    }

    if (errors) {
      process.exit();
    }
  });

  const worker = child_process.fork('./lib/thread.js');

  worker.send({
    status: CONST.STATUS.BOOTSTRAP,
    data: options
  });

  return worker;
}

Object.defineProperty(extractor, 'STATUS', {
  writable: false,
  enumerable: true,
  configurable: false,
  value: CONST.STATUS
});

module.exports = extractor;
