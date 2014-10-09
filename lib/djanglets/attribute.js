"use strict";
var Attribute, 
    type = require("./template").type;

/**
 * Prototype for Attribute
 */
Attribute = {
  /**
   * @type {string}
   * @private
   */
  name_: "",
};

function createAttribute() {
  return Object.create(Attribute, {
    name: {
      set: function (name) {
        this.name_ = name.toLowerCase();
      },
      get: function () {
        return this.name_;
      },
      enumerable: true,
    },
    /**
     * @type {string|Variable}
     */
    value: {
      value: [],
      writable: true,
    },
    /**
     * @return {Object}
     */
    valueOf: {
      value: function () {
        return {
          value: this.value,
          name: this.name,
        };
      },
    },
  });
}

module.exports = {
  Attribute: Attribute,
  createAttribute: createAttribute,
};
