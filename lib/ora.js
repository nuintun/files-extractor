/**
 * @module ora
 * @license MIT
 * @version 2017/09/19
 * @see https://github.com/sindresorhus/ora
 */

'use strict';

const chalk = require('chalk');
const typeOf = require('./typeof');
const cliCursor = require('cli-cursor');
const logSymbols = require('log-symbols');
const cliSpinners = require('cli-spinners');

/**
 * @class Ora
 */
class Ora {
  /**
   * @constructor
   * @param {Object} options
   */
  constructor(options) {
    if (typeOf(options) === 'string') {
      options = {
        text: options
      };
    }

    this.options = options = Object.assign(
      {
        text: '',
        color: 'cyan',
        stream: process.stderr
      },
      options
    );

    const sp = options.spinner;

    this.spinner =
      typeOf(sp) === 'object'
        ? sp
        : process.platform === 'win32' ? cliSpinners.line : cliSpinners[sp] || cliSpinners.dots;

    if (this.spinner.frames === undefined) {
      throw new Error('Spinner must define `frames`');
    }

    this.text = options.text;
    this.color = options.color;
    this.interval = options.interval || this.spinner.interval || 100;
    this.stream = options.stream;
    this.id = null;
    this.frameIndex = 0;
    this.enabled =
      typeOf(options.enabled) === 'boolean' ? options.enabled : this.stream && this.stream.isTTY && !process.env.CI;
  }

  /**
   * @method frame
   * @returns {string}
   */
  frame() {
    const frames = this.spinner.frames;
    let frame = frames[this.frameIndex];

    if (this.color) {
      frame = chalk[this.color](frame);
    }

    this.frameIndex = ++this.frameIndex % frames.length;

    return frame + ' ' + this.text;
  }

  /**
   * @method clear
   * @returns {Ora}
   */
  clear() {
    if (!this.enabled) {
      return this;
    }

    this.stream.clearLine();
    this.stream.cursorTo(0);

    return this;
  }

  /**
   * @method render
   * @returns {Ora}
   */
  render() {
    this.clear();
    this.stream.write(this.frame());

    return this;
  }

  /**
   * @method start
   * @param {string} text
   * @returns {Ora}
   */
  start(text) {
    if (text) {
      this.text = text;
    }

    if (!this.enabled || this.id) {
      return this;
    }

    cliCursor.hide(this.stream);
    this.render();

    this.id = setInterval(this.render.bind(this), this.interval);

    return this;
  }

  /**
   * @method stop
   * @returns {Ora}
   */
  stop() {
    if (!this.enabled) {
      return this;
    }

    clearInterval(this.id);

    this.id = null;
    this.frameIndex = 0;

    this.clear();
    cliCursor.show(this.stream);

    return this;
  }

  /**
   * @method succeed
   * @param {string} text
   * @returns {Ora}
   */
  succeed(text) {
    return this.stopAndPersist({ symbol: logSymbols.success, text });
  }

  /**
   * @method fail
   * @param {string} text
   * @returns {Ora}
   */
  fail(text) {
    return this.stopAndPersist({ symbol: logSymbols.error, text });
  }

  /**
   * @method warn
   * @param {string} text
   * @returns {Ora}
   */
  warn(text) {
    return this.stopAndPersist({ symbol: logSymbols.warning, text });
  }

  /**
   * @method info
   * @param {string} text
   * @returns {Ora}
   */
  info(text) {
    return this.stopAndPersist({ symbol: logSymbols.info, text });
  }

  /**
   * @method stopAndPersist
   * @param {Object} options
   * @returns {Ora}
   */
  stopAndPersist(options) {
    // Legacy argument
    // TODO: Deprecate sometime in the future
    if (typeOf(options) === 'string') {
      options = {
        symbol: options
      };
    }

    options = options || {};

    this.stop();
    this.stream.write(`${options.symbol || ' '} ${options.text || this.text}\n`);

    return this;
  }
}

/**
 * @function ora
 * @param {Object} opts
 * @returns {Ora}
 */
module.exports = function(opts) {
  return new Ora(opts);
};

/**
 @function promise
 * @param {Promise} action
 * @param {Object} options
 * @returns {Ora}
 */
module.exports.promise = function(action, options) {
  if (typeOf(action.then) !== 'function') {
    throw new TypeError('Parameter `action` must be a Promise');
  }

  const spinner = new Ora(options);

  spinner.start();

  action.then(
    () => {
      spinner.succeed();
    },
    () => {
      spinner.fail();
    }
  );

  return spinner;
};
