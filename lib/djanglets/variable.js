"use strict";
var Variable,
    escapes,
    type = require("./template").type;

/**
 * @enum {Object.<string, RegExp>}
 */
escapes = {
  "&amp;": /&/g,
  "&lt;": /</g,
  "&gt;": />/g,
  "&quot;": /"/g,
  "&#39;": /'/g,
};

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
        return {
          type: type.VARIABLE,
          name: this.name,
        };
      },
    },
    /**
     * @param {Object=} opt_data
     * return {string}
     */
    toString: {
      value: function (opt_data) {
        var data, result;
        data = opt_data || {};
        result = "";
        if (data.hasOwnProperty(this.name)) {
          result = data[this.name].toString(data);
        }
        return this.escape(result);
      },
    },
    /**
     * @return {Variable}
     */
    preRender: {
      value: function () {
        return [this];
      },
      enumerable: true,
    },
    /**
     * @param {string}
     * @return {string}
     */
    escape: {
      value: function (text) {
        var keys;
        keys = Object.keys(escapes);
        keys.forEach(function (safe) {
          var unsafe;
          unsafe = escapes[safe];
          text = text.replace(unsafe, safe);
        });
        return text;
      }
    },
  });
  variable.name = name;
  return variable;
};

module.exports = {
  Variable: Variable,
  createVariable: createVariable,
};
