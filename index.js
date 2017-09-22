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

let yaml = utils.loadYAML(CONST.YAML_SRC) || {};

function extractor(options) {
  options = options || {};

  CONST.OPTIONS_KEYS.forEach(function(key) {
    let value = options[key];
    let yamlValue = yaml[key];
    let format = formatter[key];
    let validate = validator[key];
    let hasOwnKey = options.hasOwnProperty(key);
    let yamlHasOwnKey = yaml.hasOwnProperty(key);

    if (hasOwnKey) {
      switch (key) {
        case 'start':
          value = options[key] = utils.parseDate(value);
          break;
        case 'end':
          value = options[key] = utils.parseDate(value);
          break;
        case 'types':
          value = options[key] = utils.parseTypes(value);
          break;
      }
    }

    if (!hasOwnKey || !validate(value)) {
      options[key] = yamlHasOwnKey ? yamlValue : format(value);
    }
  });

  let worker = child_process.fork('./lib/thread.js');

  worker.send({
    status: CONST.STATUS.BOOTSTRAP,
    data: options
  });

  return worker;
}

module.exports = extractor;
