"use strict";

var For, type = require("./template").type;

For = {};

/**
 * @param {string} key
 * @param {string} value
 * @param {string} variable
 * @return {For}
 */
function createFor(key, value, variable) {
  /**
   * @type {For}
   * @constructor
   */
  return Object.create(For, {
    /**
     * @type {string}
     */
    type: {
      value: type.FOR,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    key: {
      value: key,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    value: {
      value: value,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    variable: {
      value: variable,
      enumerable: true,
    },
    /**
     * @type {Array.<Object>}
     */
    children: {
      value: [],
      enumerable: true,
    },
    valueOf: {
      value: function () {
        return {
          type: type.FOR,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
          key: this.key,
          value: this.value,
          variable: this.variable,
        };
      },
      enumerable: true,
    },
    preRender: {
      value: function () {
        return ["prerendered for goes here."];
      },
    },
  });
}

module.exports = {
  For: For,
  createFor: createFor,
};
