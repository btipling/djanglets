"use strict";
var Variable,
    type = require("./template").type;

/**
 * Prototype for Variable.
 */
Variable = {
  /**
   * @type {string}
   * @private
   */
  name_: "",
};

/**
 * @param {string} name
 */
function createVariable(name) {
  var variable;
  variable = Object.create(Variable, {
    name: {
      set: function (name) {
        this.name_ = name.toLowerCase();
      },
      get: function () {
        return this.name_;
      },
      enumerable: true,
    },
    valueOf: {
      value: function () {
        console.log("var valueOf", this.name);
        return {
          type: type.VARIABLE,
          name: this.name,
        };
      },
    }
  });
  variable.name = name;
  return variable;
};

module.exports = {
  Variable: Variable,
  createVariable: createVariable,
};
