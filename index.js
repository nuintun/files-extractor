/*!
 * index
 * Version: 0.0.1
 * Date: 2017/09/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const ora = require('ora');
const glob = require('glob');
const path = require('path');
const fs = require('fs-extra')
const yaml = require('js-yaml');
const chalk = require('chalk');
const utils = require('./lib/utils');
const async = require('./lib/async');
const ProgressBar = require('progress');
const spinners = require('cli-spinners');

const CWD = utils.CWD;
const YAML = 'fextract.yml';
const YAMLFILE = path.join(CWD, YAML);
const searching = chalk.reset.green.bold('Searching');
const filtering = chalk.reset.green.bold('Filtering');
const load = ora({ text: searching, stream: process.stdout, spinner: spinners.line });

function filter(files, options) {
  return files.filter(function(file) {
    load.text = `${ filtering }: ${ chalk.reset.cyan.bold(file) }`;

    let stat;

    try {
      stat = fs.statSync(path.join(CWD, file));
    } catch (error) {
      return false;
    }

    let time = stat[options.type];

    return time >= options.start && time <= options.end;
  });
}

function padStart(value, length) {
  return utils.padStart(value, length, '0');
}

function formatDate(date) {
  let year = date.getFullYear();
  let month = padStart(date.getMonth() + 1, 2);
  let day = padStart(date.getDate(), 2);
  let hour = padStart(date.getHours(), 2);
  let minutes = padStart(date.getMinutes(), 2);
  let seconds = padStart(date.getSeconds(), 2);
  let millisecond = padStart(date.getMilliseconds(), 3);

  return `${ year }${ month }${ day }${ hour }${ minutes }${ seconds }${ millisecond }`;
}

function dest(file, options) {
  return path.join(CWD, options.output, `${ formatDate(options.start) } - ${ formatDate(options.end) }`, file);
}

function FilesExtractor(options) {
  let ignore = options.ignore;
  let output = options.output;

  ignore.push(output + '**/*', YAML);

  this.options = options;
}

FilesExtractor.loadYAML = function() {
  let ini = {};

  // File config
  if (fs.pathExistsSync(YAMLFILE)) {
    // Parse yaml
    let source = fs.readFileSync(YAMLFILE);

    ini = yaml.safeLoad(source, { filename: YAMLFILE });
  }

  return ini;
}

FilesExtractor.prototype = {
  extract: function() {
    load.start();

    let options = this.options;

    glob(options.files, { root: CWD, dot: options.dot, nodir: true, ignore: options.ignore }, function(error, files) {
      if (error) {
        load.stop();

        return process.stderr.write(error);
      }

      files = filter(files, options);

      load.stop();

      let extracting = chalk.reset.green.bold('Extracting');
      let fmt = `${ extracting }: [:bar] (:current/:total) :percent - :file`;
      let bar = new ProgressBar(fmt, { width: 30, clear: true, total: files.length, stream: process.stdout, head: '>' });

      async.series(files, function(file, next) {
        fs.copy(file, dest(file, options), { preserveTimestamps: true }, function(error) {
          bar.tick({ file: chalk.reset.cyan.bold(file) });

          if (error) {
            let syscall = error.syscall || 'extract';
            let code = error.code || 'failed';

            bar.interrupt(`${ extracting }: ${ syscall } ${ chalk.reset.red.bold(file) } ${ code }!`);
          }

          next();
        });
      }, function() {
        let message = files.length ? 'Oh yeah, extract the matched files successfully!' : 'Oops, there is no files matched the condition!';

        process.stdout.write(chalk.reset.green.bold(message));
        process.exit();
      });
    }).on('match', function(file) {
      load.text = `${ searching }: ${ chalk.reset.cyan.bold(file) }`;
    });

    return this;
  }
};

module.exports = FilesExtractor;
