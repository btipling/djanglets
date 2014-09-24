"use strict";
var preRender = require("../djanglets/element").preRender;

/**
 * @return {DomState}
 */
function createDomState() {
  /**
   * @type {DomState}
   * @constructor
   */
  return Object.create({}, {
    id: {
      value: "",
      writable: true,
      enumerable: true,
    },
    index: {
      value: 0,
      writable: true,
      enumerable: true,
    },
    /**
     * @type {*}
     */
    value: {
      value: "",
      writable: true,
      enumberable: true,
    },
    /**
     * @type {Array.<Object>}
     */
    attributes: {
      value: [],
      enumberable: true,
    },
    /**
     * @type {Array.<DomState>}
     */
    children: {
      value: [],
      enumberable: true,
    },
    /**
     * @type {string}
     */
    type: {
      value: "",
      writable: true,
      enumerable: true,
    },
    /**
     * @type {DomState}
     */
    parent: {
      value: null,
      writable: true,
      enumerable: true,
    },
    preRender: {
      value: function () {
        if (this.type === "string") {
          return this.value;
        }
        return preRender.apply(this);
      },
    },
  });
}

module.exports = {
  createDomState: createDomState,
};
