"use strict";
var Element,
    template = require("./template");

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
    /**
     * @type {boolean}
     */
    selfClosing: {
      value: false,
      writable: true,
      enuerable: true,
    },
    /**
     * @type {Array.<Attribute>}
     */
    attributes: {
      enumberable: true,
      value: [],
    },
    /**
     * @type {Array.<string|Variable|Element>}
     */
    children: {
      enumberable: true,
      value: [],
    },
    /**
     * @return {Object}
     */
    valueOf: {
      value: function () {
        var children, attributes, value;
        children = this.children.map(function (child) {
          return child.valueOf();
        });
        attributes = this.attributes.map(function (attr) {
          return attr.valueOf();
        });
        value = {
          type: template.type.ELEMENT,
          name: this.type,
        };
        if (this.selfClosing) {
          value.selfClosing = true;
        }
        if (children.length) {
          value.children = children;
        }
        if (attributes.length) {
          value.attributes = attributes;
        }
        return value;
      },
    },
    /**
     * @return {Array}
     */
    preRender: {
      value: function () {
        var result;
        if (this.type === template.TEMPLATE_TYPE) {
          return this.preRenderChildren();
        }
        result = ["<", this.type];
        this.attributes.forEach(function (attr) {
          result.push(" ");
          result.push(attr.name);
          result.push("=\"");
          result.push(attr.value);
          result.push("\"");
        });
        if (this.selfClosing) {
          result.push("/>");
          return result;
        }
        result.push(">");
        result = result.concat(this.preRenderChildren());
        result.push("</");
        result.push(this.type);
        result.push(">");
        return result;
      },
    },
    /**
     * @return {Array}
     */
    preRenderChildren: {
      value: function () {
        return this.children.map(function (child) {
          if (child.hasOwnProperty("preRender")) {
            return child.preRender();
          } else {
            return child.toString();
          }
        });
      },
    },
  });
}

module.exports = {
  Element: Element,
  createElement: createElement,
};
