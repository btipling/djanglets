"use strict";

var TEMPLATE_TYPE = require("../djanglets/template").TEMPLATE_TYPE;

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
        var el;
        if (this.type === TEMPLATE_TYPE) {
          return this.children.map(function (child) {
            return child.preRender();
          });
        } else if (this.type === "string") {
          return new Text(this.value);
        }
        el = document.createElement(this.type);
        this.attributes.forEach(function (attribute) {
          el.setAttribute(attribute.name, attribute.value);
        });
        this.children.forEach(function (child) {
          el.appendChild(child.preRender());
        });
        return el;
      },
    },
  });
}

module.exports = {
  createDomState: createDomState,
};
