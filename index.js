'use strict';

var glob = require('glob');
var path = require('path');
var fs = require('fs-extra')
var yaml = require('js-yaml');
var colors = require('colors');
var utils = require('./lib/utils');
var archiver = require('archiver');

var CWD = process.cwd();
var YAMLFILE = path.join(CWD, 'fextract.yml');

function FilesExtractor(ini, options) {
  ini = ini || {};

  if (!utils.dateIsValid(options.start)) {
    if (!ini.start) {
      return process.stderr.write(colors.reset.red.bold('Please set a correct start date value.\n'));
    }
  }

  console.log(ini, options, utils.dateIsValid(options.start));
}

FilesExtractor.loadYAML = function() {
  var ini = {};

  // File config
  if (fs.pathExistsSync(YAMLFILE)) {
    // Parse yaml
    var source = fs.readFileSync(YAMLFILE);

    ini = yaml.safeLoad(source, { filename: YAMLFILE });
  }

  return ini;
}

FilesExtractor.prototype = {
  extract: function() {

  }
};

module.exports = FilesExtractor;
