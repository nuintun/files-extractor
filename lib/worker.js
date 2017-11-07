/**
 * @module worker
 * @license MIT
 * @version 2017/09/22
 */

'use strict';

const CONST = require('./const');
const FilesExtractor = require('./fextract');

process.once('message', (message) => {
  if (message.status === CONST.STATUS.BOOTSTRAP) {
    return new FilesExtractor(message.data);
  }
});
