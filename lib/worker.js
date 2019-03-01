/**
 * @module worker
 * @license MIT
 */

'use strict';

const CONST = require('./const');
const FilesExtractor = require('./fextract');

process.once('message', message => {
  if (message.status === CONST.STATUS.BOOTSTRAP) {
    return new FilesExtractor(message.data);
  }
});
