/*!
 * UI
 *
 * Version: 0.0.1
 * Date: 2017/09/22
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const ora = require('ora');
const CONST = require('./const');
const utils = require('./utils');
const ProgressBar = require('progress');
const logSymbols = require('log-symbols');

const color = utils.color;
const STATUS = CONST.STATUS;
const stdout = process.stdout;
const starting = color('Starting...', 'green');
const searching = color('Searching', 'green');
const filtering = color('Filtering', 'green');
const extracting = color('Extracting', 'green');
const fmt = `${ extracting }: [:bar] (:current/:total) :percent - :file`;

function loadingText(loading, text) {
  if (loading.id !== null) {
    loading.text = text;
  } else {
    loading.start(text);
  }
}

function UI(worker) {
  this.worker = worker;

  return this.render();
}

UI.prototype = {
  spinner: function() {
    return this.loading = ora({
      stream: stdout
    }).start(starting);
  },
  steps: function(total) {
    return this.progress = new ProgressBar(fmt, {
      width: 30,
      clear: true,
      total: total,
      stream: stdout,
      head: '>'
    });
  },
  render: function() {
    let context = this;
    let worker = context.worker;

    // Listen message event
    worker.on('message', function(message) {
      let data = message.data;
      let loading = context.loading;
      let progress = context.progress;

      switch (message.status) {
        case STATUS.BOOTSTRAP:
          context.spinner();
          break;
        case STATUS.FAILED:
          loading.fail(data.message);
          process.exit();
          break;
        case STATUS.WARNING:
          progress.interrupt(`${ logSymbols.warning } ${ data.syscall } ${ color(data.file, 'red') } ${ data.code }!`);
          break;
        case STATUS.SEARCHING:
          loadingText(loading, `${ searching }: ${ color(data) }`);
          break;
        case STATUS.FILTERING:
          loadingText(loading, `${ filtering }: ${ color(data) }`);
          break;
        case STATUS.FILTERED:
          loading.stop();
          context.steps(data.length);
          break;
        case STATUS.EXTRACTING:
          progress.tick({ file: color(data) });
          break;
        case STATUS.EXTRACTED:
          progress.terminate();
          loading.succeed(color(data, 'cyan', false));
          process.exit();
          break;
      }
    });

    return context;
  }
}

module.exports = UI;
