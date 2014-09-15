var Element;

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
  });
}

module.exports = {
  Element: Element,
  createElement: createElement,
};
