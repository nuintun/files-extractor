/*!
 * async
 *
 * Date: 2017/05/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

const nextTick = process.nextTick;

/**
 * @class Iterator
 */
class Iterator {
  /**
   * @constructor
   * @param {Array} array
   */
  constructor(array) {
    this.index = 0;
    this.array = Array.isArray(array) ? array : [];
  }

  /**
   * @method next
   * @description Create the next item.
   * @returns {{done: boolean, value: undefined}}
   */
  next() {
    const done = this.index >= this.array.length;
    const value = !done ? this.array[this.index++] : undefined;

    return {
      done: done,
      value: value
    };
  }
}

/**
 * Exports module
 */
module.exports = {
  Iterator: Iterator,
  series: function(array, iterator, done, context) {
    // Create a new iterator
    const it = new Iterator(array);

    /**
     * @function walk
     * @param it
     */
    function walk(it) {
      const item = it.next();

      if (item.done) {
        done();
      } else {
        iterator(item.value, () => {
          walk(it);
        }, it.index);
      }
    }

    // Run walk
    walk(it);
  }
};
