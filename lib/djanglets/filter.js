"use strict";

var Filter;
/**
 * Prototype for Filter.
 */
Filter = {
};

/**
 * @param {string} name
 * @param {string?} arg
 */
function createFilter (name, arg) {
  return Object.create(Filter, {
    /**
     * @type {string}
     */
    name: {
      value: name,
      enumerable: true,
    },
    /**
     * @type {string?}
     */
    argument: {
      value: arg,
      enumerable: true,
    },
  });
}

module.exports = {
  Filter: Filter,
  createFilter: createFilter,
};
