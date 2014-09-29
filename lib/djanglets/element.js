"use strict";
var Element,
    utils = require("./utils"),
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
    /**
     * @type {string}
     */
    id: {
      value: "djlt." + utils.getUniqueId(),
    },
    djangletType: {
      value: template.type.ELEMENT,
    },
    type: {
      set: function (type) {
        this.elementType_ = type.toUpperCase();
      },
      get: function () {
        return this.elementType_;
      },
      enumerable: true,
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
          id: this.id,
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
        var children, results;
        children = [];
        this.children.forEach(function (child) {
          if (child.hasOwnProperty("preRender")) {
            children = children.concat(child.preRender());
          } else {
            children.push(child.toString());
          }
        });
        if (this.type === template.TEMPLATE_TYPE) {
          return children;
        }
        results = [];
        utils.flattenPreRender(results, children);
        return [Object.create({}, {
          type: {
            value: this.type,
          },
          attributes: {
            value: this.attributes,
          },
          children: {
            value: results,
          },
          selfClosing: {
            value: this.selfClosing,
          },
          /**
           * @param {*=} opt_data
           * @return {string}
           */
          toString: {
            value: function (opt_data) {
              var result, id, resultId;
              result  = ["<", this.type];
              this.attributes.forEach(function (attr) {
                result.push(" ");
                result.push(attr.name);
                result.push("=\"");
                result.push(attr.value);
                result.push("\"");
              });
              if (this.selfClosing) {
                result.push("/>");
                return result.join("");
              }
              result.push(">");
              result = result.concat(this.children.map(function (child) {
                return child.toString(opt_data);
              }));
              result.push("</");
              result.push(this.type);
              result.push(">");
              return result.join("");
            },
            enumerable: true,
          },
        })];
      },
    },
  });
}

module.exports = {
  Element: Element,
  createElement: createElement,
};
