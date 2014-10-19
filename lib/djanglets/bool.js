"use strict";

var Bool;

Bool = {
  operators: {
    OR: "OR",
    AND: "AND",
  },
};

function createBoolean() {
  return Object.create(Bool, {
    /**
     * @type {variable}
     */
    variable: {
      value: null,
      writable: true,
    },
    /**
     * @type {boolean}
     */
    not: {
      value: false,
      writable: true,
    },
    /**
     * @type {Bool}
     */
    and: {
      value: null,
      writable: true,
    },
    /**
     * @type {Bool}
     */
    or: {
      value: null,
      writable: true,
    },
    /**
     * @type {Variable}
     */
    in: {
      value: null,
      writable: true,
    },
    /**
     * @type {Variable}
     */
    notIn: {
      value: null,
      writable: true,
    },
  });
}

module.exports = {
  Boolean: Boolean,
  createBoolean: createBoolean,
};

