/**
 * @module ui
 * @license MIT
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
const fmt = `${extracting}: [:bar] (:current/:total) :percent - :file`;

function loadingText(loading, text) {
  if (loading.id !== null) {
    loading.text = text;
  } else {
    loading.start(text);
  }
}

/**
 * @class UI
 */
class UI {
  /**
   * @constructor
   * @param {Worker} worker
   */
  constructor(worker) {
    this.worker = worker;

    this.render();
  }

  /**
   * @method spinner
   */
  spinner() {
    return (this.loading = ora({
      stream: stdout
    }).start(starting));
  }

  /**
   * @method steps
   * @param {Number} total
   */
  steps(total) {
    return (this.progress = new ProgressBar(fmt, {
      width: 30,
      clear: true,
      total: total,
      stream: stdout,
      head: '>'
    }));
  }

  /**
   * @method render
   */
  render() {
    let total = 0;
    let worker = this.worker;

    // Listen message event
    worker.on('message', message => {
      const data = message.data;

      switch (message.status) {
        case STATUS.BOOTSTRAP:
          this.spinner();
          break;
        case STATUS.FAILED:
          this.loading.fail(data);
          utils.exit(1);
          break;
        case STATUS.WARNING:
          this.progress.interrupt(`${logSymbols.warning} ${data.syscall} ${color(data.file, 'red')} ${data.code}!`);
          break;
        case STATUS.SEARCHING:
          loadingText(this.loading, `${searching}: ${color(data)}`);
          break;
        case STATUS.FILTERING:
          loadingText(this.loading, `${filtering}: ${color(data)}`);
          break;
        case STATUS.FILTERED:
          total = data.length;

          loadingText(this.loading, color('Preparing to extract...', 'green'));
          break;
        case STATUS.EXTRACTING:
          if (total) {
            this.loading.stop();
            this.steps(total);

            total = 0;
          }

          this.progress.tick({ file: color(data) });
          break;
        case STATUS.EXTRACTED:
          this.progress.terminate();
          this.loading.succeed(color(data, 'cyan', false));
          utils.exit(0);
          break;
      }
    });
  }
}

module.exports = UI;
