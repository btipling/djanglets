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
    },
    /**
     * @type {string|Variable}
     */
    value: {
      writable: true,
    },
    /**
     * @return {Object}
     */
    valueOf: {
      value: function () {
        return {
          type: type.ATTRIBUTE,
          value: this.value,
        };
      },
    },
  });
}

module.exports = {
  Attribute: Attribute,
  createAttribute: createAttribute,
};
