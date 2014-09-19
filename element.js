"use strict";
var Element,
    type = require("./template").type

/**
 * Element prototype.
 */
Element = {
  /**
   * @string
   * @private
   */
  elementType_: "",
};

/**
 * @return Element
 */
function createElement() {
  return Object.create(Element, {
    type: {
      set: function (type) {
        this.elementType_ = type.toLowerCase();
      },
      get: function () {
        return this.elementType_;
      },
    },
    attributes: {
      enumberable: true,
      value: [],
    },
    children: {
      enumberable: true,
      value: [],
    },
    /**
     * @return {Object}
     */
    valueOf: {
      value: function () {
        var children, attributes;
        children = this.children.map(function (child) {
          return child.valueOf();
        });
        attributes = this.attributes.map(function (attr) {
          return attr.valueOf();
        });
        return {
          type: type.ELEMENT,
          name: this.type,
          children: children,
          attributes: attributes,
        };
      },
    },
  });
}

module.exports = {
  Element: Element,
  createElement: createElement,
};
