"use strict";

var Variable = {};

/**
 * @param {string} name
 * @return {MeteorVariable}
 */
function createVariable(name) {
  if (!name) {
    throw "A live meteor variable needs a name";
  }
  /**
   * @type {MeteorVariable}
   * @constructor
   */
  return Object.create(Variable, {
    name: {
      value: name,
    },
    tracker: {
      value: null,
      writable: true,
      enumerable: true,
    },
    value: {
      value: null,
      writable: true,
      enumerable: true,
    },
  });
}

module.exports = {
  createVariable: createVariable,
  Variable: Variable,
};
