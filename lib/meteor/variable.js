"use strict";

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
  return Object.create({}, {
    name: {
      value: name,
    },
    tracker: {
      value: null,
      writable: true,
      enumerable: true,
    },
    variables: {
      value: [],
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
  createVariable: createVariable
};
