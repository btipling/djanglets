"use strict";

var template = require("../djanglets/template");

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
        switch (this.type) {
          case template.TEMPLATE_TYPE:
            //Just return the children of the template, not the template itself.
            return this.children.map(function (child) {
              return child.preRender();
            });
          case template.type.STRING:
            return new Text(this.value);
          default:
            el = document.createElement(this.type);
            this.attributes.forEach(function (attribute) {
              el.setAttribute(attribute.name, attribute.value);
            });
            this.children.forEach(function (child) {
              el.appendChild(child.preRender());
            });
          return el;
        }
      },
    },
  });
}

module.exports = {
  createDomState: createDomState,
};
