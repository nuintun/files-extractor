/*!
 * datepicker
 *
 * Version: 0.0.1
 * Date: 2017/05/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

// Dependencies
const util = require('util');
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const cloneDeep = require('lodash.clonedeep');
const defaultsDeep = require('lodash.defaultsdeep');
const isNull = require('lodash.isnull');
const isUndefined = require('lodash.isundefined');
const findIndex = require('lodash.findindex');
const findLastIndex = require('lodash.findlastindex');

const dateFns = require('date-fns');
const parse = dateFns.parse;
const format = dateFns.format;
const setYear = dateFns.setYear;
const setMonth = dateFns.setMonth;
const setDay = dateFns.setDay;
const setHours = dateFns.setHours;
const setMinutes = dateFns.setMinutes;
const setSeconds = dateFns.setSeconds;
const setMilliseconds = dateFns.setMilliseconds;
const addYears = dateFns.addYears;
const addMonths = dateFns.addMonths;
const addDays = dateFns.addDays;
const addHours = dateFns.addHours;
const addMinutes = dateFns.addMinutes;
const addSeconds = dateFns.addSeconds;
const addMilliseconds = dateFns.addMilliseconds;
const isAfter = dateFns.isAfter;
const isBefore = dateFns.isBefore;

// Include Inquirer.js
const Base = require('inquirer/lib/prompts/base');
const observe = require('inquirer/lib/utils/events');

function setDate(date, settings) {
  Object.keys(settings).forEach(function(key) {
    let value = settings[key];

    switch (key) {
      case 'year':
        setYear(date, value);
        break;
      case 'month':
        setMonth(date, value);
        break;
      case 'day':
        setDay(date, value);
        break;
      case 'hour':
        setHours(date, value);
        break;
      case 'minutes':
        setMinutes(date, value);
        break;
      case 'second':
        setSeconds(date, value);
        break;
      case 'millisecond':
        setMilliseconds(date, value);
        break;
    }
  });

  return date;
}

// Parse Date Parameters
function standardizeTime(date) {
  return setDate(parse('1970/1/1'), {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  });
}

function roundTo(num, round) {
  return Math.round(num / round) * round;
}

/**
 * Constructor
 */
function Prompt() {
  Base.apply(this, arguments);

  // Set Defaults
  this.opt = cloneDeep(this.opt);

  defaultsDeep(this.opt, {
    date: {
      max: null,
      min: null
    },
    time: {
      min: null,
      max: null,
      hours: {
        interval: 1
      },
      minutes: {
        interval: 1
      },
      seconds: {
        interval: 1
      },
      millisecond: {
        interval: 1
      }
    }
  });

  // Set Default Format
  if (isNull(this.opt.format) || isUndefined(this.opt.format)) {
    this.opt.format = ['YYYY', '/', 'D', '/', 'M', ' ', 'hh', ':', 'mm', ':', 'ss', '.', 'SSS', ' ', 'A'];
  }

  this.opt.date.min = (typeof this.opt.date.min === 'string') ? parse(this.opt.date.min) : null;
  this.opt.date.max = (typeof this.opt.date.max === 'string') ? parse(this.opt.date.max) : null;
  this.opt.time.min = (typeof this.opt.time.min === 'string') ? standardizeTime(parse(this.opt.time.min)) : null;
  this.opt.time.max = (typeof this.opt.time.max === 'string') ? standardizeTime(parse(this.opt.time.max)) : null;

  console.log(parse('5:00 PM'))

  // Determine Date for Start of Prompt
  var startDate = this.opt.initial || new Date();

  if (this.opt.date.min) {
    startDate = setDate(startDate, {
      day: this.opt.date.min.getDate(),
      month: this.opt.date.min.getMonth(),
      year: this.opt.date.min.getFullYear()
    });
  }

  if (this.opt.time.min) {
    startDate = setDate(startDate, {
      hour: this.opt.time.min.getHours(),
      minutes: this.opt.time.min.getMinutes(),
      seconds: this.opt.time.min.getSeconds()
    });
  }

  // Define Selection, State Helper for Selection
  this._selection = {
    cur: 0,
    value: 0,
    date: startDate,
    elements: []
  };

  // Parse Elements
  var opt = this.opt;
  var selection = this._selection;

  function validateDate(propose) {
    propose = new Date(propose);

    // Validate Time
    if (opt.time.max && standardizeTime(propose) > opt.time.max) {
      propose = setDate(propose, {
        hour: roundTo(opt.time.max.getHours(), opt.time.hours.interval),
        minute: roundTo(opt.time.max.getMinutes(), opt.time.minutes.interval),
        seconds: roundTo(opt.time.max.getSeconds(), opt.time.seconds.interval)
      });
    } else if (opt.time.min && standardizeTime(propose) < opt.time.min) {
      propose = setDate(propose, {
        hour: roundTo(opt.time.min.getHours(), opt.time.hours.interval),
        minute: roundTo(opt.time.min.getMinutes(), opt.time.minutes.interval),
        seconds: roundTo(opt.time.min.getSeconds(), opt.time.seconds.interval)
      });
    } else {
      propose = setDate(propose, {
        hour: roundTo(propose.getHours(), opt.time.hours.interval),
        minute: roundTo(propose.getMinutes(), opt.time.minutes.interval),
        seconds: roundTo(propose.getSeconds(), opt.time.seconds.interval)
      });
    }

    // Validate Date
    if (opt.date.max && isAfter(propose, opt.date.max)) {
      propose = validateDate(opt.date.max);
    }

    if (opt.date.min && isBefore(propose, opt.date.min)) {
      propose = validateDate(opt.date.min);
    }

    return propose;
  };

  this._selection.date = validateDate(this._selection.date);

  this.opt.format.forEach(function(str) {
    switch (str) {
      case 'D':
      case 'Do':
      case 'DD':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addDays(selection.date, diff));
          },
          set: val => {
            selection.date = validateDate(setDate(selection.date, { day: val }));
          }
        });
        break;
      case 'M':
      case 'Mo':
      case 'MM':
      case 'MMMM':
      case 'MMMMM':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addMonths(selection.date, diff));
          },
          set: val => {
            if (val.toString().length > 2) {
              selection.value = 0;
            }
            selection.date = validateDate(setDate(selection.date, { month: val - 1 }));
          }
        });
        break;
      case 'YY':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addYears(selection.date, diff));
          },
          set: val => {
            if (val.toString().length > 2) {
              selection.value = 0;
            }
            selection.date = validateDate(setDate(selection.date, { year: 2000 + val }));
          }
        });
        break;
      case 'YYYY':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addYears(selection.date, diff));
          },
          set: val => {
            if (val.toString().length > 4) {
              selection.value = 0;
            }
            selection.date = validateDate(setDate(selection.date, { year: val }));
          }
        });
        break;
      case 'h':
      case 'hh':
      case 'H':
      case 'HH':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addHours(selection.date, diff * opt.time.hours.interval));
          },
          set: val => {
            if (val >= 60) {
              selection.value = 0;
            }

            if (selection.date.getHours() <= 12) {
              selection.date = validateDate(setDate(selection.date, { hour: val }));
            } else {
              selection.date = validateDate(setDate(selection.date, { hour: val + 12 }));
            }
          }
        });
        break;
      case 'm':
      case 'mm':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addMinutes(selection.date, diff * opt.time.minutes.interval));
          },
          set: val => {
            if (val >= 60) {
              selection.value = 0;
            }
            selection.date = validateDate(setDate(selection.date, { minute: val }));
          }
        });
        break;
      case 's':
      case 'ss':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addSeconds(selection.date, diff * opt.time.seconds.interval));
          },
          set: val => {
            if (val >= 60) {
              selection.value = 0;
            }
            selection.date = validateDate(setDate(selection.date, { second: val }));
          }
        });
        break;
      case 'SSS':
        selection.elements.push({
          add: diff => {
            selection.date = validateDate(addMilliseconds(selection.date, diff * opt.time.millisecond.interval));
          },
          set: val => {
            if (val >= 60) {
              selection.value = 0;
            }
            selection.date = validateDate(setDate(selection.date, { millisecond: val }));
          }
        });
        break;
      case 'A':
      case 'a':
      case 'aa':
        selection.elements.push({
          add: () => {
            if (selection.date.getHours() >= 12) {
              selection.date = validateDate(addHours(selection.date, -12));
            } else {
              selection.date = validateDate(addHours(selection.date, 12));
            }
          },
          set: () => {}
        });
        break;
      default:
        selection.elements.push(null);
    }
  });

  return this;
}
util.inherits(Prompt, Base);

/**
 * Start the Inquiry session
 * @param  {Function} cb   Callback when prompt is done
 * @return {this}
 */

Prompt.prototype._run = function(cb) {
  this.done = cb;

  // Once user confirm (enter key)
  var events = observe(this.rl);
  events.keypress.takeUntil(events.line).forEach(this.onKeypress.bind(this));
  events.line.take(1).forEach(this.onEnd.bind(this));

  // Init
  cliCursor.hide();
  this.render();
  return this;
};

/**
 * Render the prompt to screen
 * @return {Prompt} self
 */

Prompt.prototype.render = function() {
  var message = this.getQuestion();
  var selection = this._selection;

  this.opt.format.forEach(function(str, index) {
    if (selection.cur === index) {
      message += chalk.reset.inverse(format(selection.date, str));
    } else {
      message += format(selection.date, str);
    }
  });

  this.screen.render(message);
  return this;
};

/**
 * When user press `enter` key
 */
Prompt.prototype.onEnd = function() {
  var screen = this.screen;
  var message = this.getQuestion();
  var selection = this._selection;

  this.status = 'answered';

  this.opt.format.forEach(function(str) {
    message += chalk.reset.cyan(format(selection.date, str));
  });

  screen.render(message);
  screen.done();
  cliCursor.show();
  this.done(selection.date);
};

/**
 * When user press a key
 */

Prompt.prototype.onKeypress = function(e) {
  var res;
  var selection = this._selection;
  var isSelectable = function(obj) {
    return obj !== null;
  };

  // Arrow Keys
  if (e.key.name === 'right') {
    res = findIndex(selection.elements, isSelectable, selection.cur + 1);
    selection.cur = (res >= 0) ? res : selection.cur;
  } else if (e.key.name === 'left') {
    res = findLastIndex(selection.elements, isSelectable, (selection.cur > 0) ? selection.cur - 1 : selection.cur);
    selection.cur = (res >= 0) ? res : selection.cur;
  } else if (e.key.name === 'up') {
    selection.elements[selection.cur].add(1);
  } else if (e.key.name === 'down') {
    selection.elements[selection.cur].add(-1);
  }

  // Numerical Entry
  var num;
  if (Number.isInteger(num = parseInt(e.value, 10))) {
    selection.value = ((selection.value * 10) + num);
    selection.elements[selection.cur].set(selection.value);
  } else {
    selection.value = 0;
  }

  this.render();
};

/**
 * Module exports
 */

module.exports = Prompt;
