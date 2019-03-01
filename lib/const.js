/**
 * @module const
 * @license MIT
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
const OPTIONS_KEYS = ['files', 'output', 'start', 'end', 'types', 'dot', 'ignore'];

// FilesExtractor status progress
const STATUS = Object.freeze({
  FAILED: 0,
  WARNING: 1,
  BOOTSTRAP: 2,
  SEARCHING: 3,
  SEARCHED: 4,
  FILTERING: 5,
  FILTERED: 6,
  EXTRACTING: 7,
  EXTRACTED: 8
});

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
