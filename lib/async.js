/*!
 * async
 * Version: 0.0.1
 * Date: 2017/05/19
 *
 * This is licensed under the MIT License (MIT).
 */

'use strict';

/**
 * Iterator
 *
 * @param array
 * @constructor
 */
function Iterator(array) {
  var context = this;

  context.index = 0;
  context.array = Array.isArray(array) ? array : [];
}

/**
 * create the next item.
 *
 * @returns {{done: boolean, value: undefined}}
 */
Iterator.prototype.next = function() {
  var context = this;
  var done = context.index >= context.array.length;
  var value = !done ? context.array[context.index++] : undefined;

  return {
    done: done,
    value: value
  };
};

/**
 * exports module
 */
module.exports = {
  Iterator: Iterator,
  series: function(array, iterator, done, context) {
    // create a new iterator
    var it = new Iterator(array);

    // bind context
    if (arguments.length >= 4) {
      iterator = iterator.bind(context);
      done = done.bind(context);
    }

    /**
     * walk iterator
     * @param it
     */
    function walk(it) {
      var item = it.next();

      if (item.done) {
        done();
      } else {
        iterator(item.value, function() {
          walk(it);
        }, item.index);
      }
    }

    // run walk
    walk(it);
  }
};
