"use strict";

var Bool;

Bool = {
  operators: {
    OR: "OR",
    AND: "AND",
  },
  comparisonOperator: {
    "==": "EQUALS",
    "!=": "NOT_EQUALS",
    ">": "GREATER_THAN",
    "<": "LESS_THAN",
    ">=": "GREATER_THAN_EQUALS",
    "<=": "LESS_THAN_EQUALS",
    "in": "IN",
    "not in": "NOT_IN",
  },
};

/**
 * @param {variable|string|number|boolean} variable
 * @param {boolean} not
 * @param {string?} comparisonType
 * @param {variable|string|number|boolean?} compareVar
 */
function createBoolean(variable, not, comparisonType, compareVar) {
  return Object.create(Bool, {
    /**
     * @type {variable|string|number|boolean}
     */
    variable: {
      value: variable,
      enumerable: true,
    },
    /**
     * @type {string?}
     */
    comparisonType: {
      value: comparisonType,
      enumerable: true,
    },
    /**
     * @type {variable|string|number|boolean?}
     */
    compareVar: {
      value: compareVar,
      enumerable: true,
    },
    /**
     * @type {boolean}
     */
    not: {
      value: not,
      enumerable: true,
    },
    /**
     * @type {Bool}
     */
    and: {
      value: null,
      enumerable: true,
      writable: true,
    },
    /**
     * @type {Bool}
     */
    or: {
      value: null,
      enumerable: true,
      writable: true,
    },
  });
}

module.exports = {
  Bool: Bool,
  createBoolean: createBoolean,
};

