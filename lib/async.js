/*!
 * async
 *
 * Version: 0.0.1
 * Date: 2017/05/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const nextTick = process.nextTick;

/**
 * Iterator
 *
 * @param array
 * @constructor
 */
function Iterator(array) {
  let context = this;

  context.index = 0;
  context.array = Array.isArray(array) ? array : [];
}

/**
 * Create the next item.
 *
 * @returns {{done: boolean, value: undefined}}
 */
Iterator.prototype.next = function() {
  let context = this;
  let done = context.index >= context.array.length;
  let value = !done ? context.array[context.index++] : undefined;

  return {
    done: done,
    value: value
  };
};

/**
 * Exports module
 */
module.exports = {
  Iterator: Iterator,
  series: function(array, iterator, done, context) {
    // Create a new iterator
    let it = new Iterator(array);

    // Bind context
    if (arguments.length >= 4) {
      iterator = iterator.bind(context);
      done = done.bind(context);
    }

    /**
     * Walk iterator
     *
     * @param it
     */
    function walk(it) {
      let item = it.next();

      if (item.done) {
        done();
      } else {
        iterator(item.value, next, it.index);
      }
    }

    /**
     * Next callback
     */
    function next() {
      nextTick(function() {
        walk(it);
      });
    }

    // Run walk
    walk(it);
  }
};
