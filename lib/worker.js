/*!
 * worker
 *
 * Date: 2017/09/22
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const CONST = require('./const');
const FilesExtractor = require('./fextract');

process.once('message', function(message) {
  if (message.status === CONST.STATUS.BOOTSTRAP) {
    return new FilesExtractor(message.data);
  }
});
