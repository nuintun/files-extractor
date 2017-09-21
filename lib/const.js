/*!
 * utils
 *
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const path = require('path');

// Workspace
const CWD = process.cwd();

// Config filename
const YAML = 'fextract.yml';

// Config src
const YAML_SRC = path.join(CWD, YAML);

// Files
const FILES = '**/*';

// Output dir
const OUTPUT = '.extract/';

// Filter types
const FILTER_TYPES = ['mtime', 'ctime', 'atime', 'birthtime'];

// Options keys
const OPTIONS_KEYS = ['files', 'output', 'start', 'end', 'types', 'dot'];

// FilesExtractor status progress
const STATUS = {
  FAILED: 0,
  WARNING: 1,
  SEARCHING: 2,
  FILTERING: 3,
  FILTERED: 4,
  EXTRACTING: 5,
  EXTRACTED: 6
};

module.exports = {
  CWD,
  YAML,
  YAML_SRC,
  FILES,
  OUTPUT,
  FILTER_TYPES,
  OPTIONS_KEYS,
  STATUS
};
