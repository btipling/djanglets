var Variable;

/**
 * Prototype for Variable.
 */
Variable = {
  /**
   * @type {string}
   * @private
   */
  name_: "",
};

function createVariable() {
  return Object.create(Variable, {
    name: {
      set: function (name) {
        this.name_ = name.toLowerCase();
      },
      get: function () {
        return this.name_;
      },
    }
  });
};

module.exports = {
  Variable: Variable,
  createVariable: createVariable,
};
