"use strict";

var If, Elif, Else,
    type = require("./template").type;

If = {};

function createIf() {
  return Object.create(If, {
    /**
     * @type {string}
     */
    type: {
      value: type.IF,
      enumerable: true,
    },
    /**
     * @type {Array.<Else|Elif>}
     */
    children: {
      value: [],
      enumerable: true,
    },
    valueOf: {
      value: function () {
        return {
          type: type.IF,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
        };
      },
    },
  });
}

Elif = {};

/**
 * @param {string} name
 * @return {Elif}
 */
function createElif(name) {
  /**
   * @type {Elif}
   * @constructor
   */
  return Object.create(Elif, {
    /**
     * @type {string}
     */
    type: {
      value: type.ELIF,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    variable: {
      variable: "",
      writable: true,
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
          type: type.ELIF,
          variable: this.variable,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
        };
      },
    },
  });
}

Else = {};

/**
 * @return {Else}
 */
function createElse() {
  /**
   * @type {Else}
   * @constructor
   */
  return Object.create(Else, {
    /**
     * @type {string}
     */
    type: {
      value: type.ELSE,
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
          type: type.ELSE,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
        };
      },
    },
  });
}

module.exports = {
  If: If,
  Elif: Elif,
  Else: Else,
  createIf: createIf,
  createElif: createElif,
  createElse: createElse,
};
