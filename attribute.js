var Attribute;

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
      writeable: true,
    },
  });
}

module.exports = {
  Attribute: Attribute,
  createAttribute: createAttribute,
};
