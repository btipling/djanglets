"use strict";

var If, Elif, Else,
    type = require("./template").type;

If = {};

function createIf() {
  return Object.create(If, {
    /**
     * @type {string}
     */
    type: {
      value: type.IF,
      enumerable: true,
    },
    /**
     * @type {Array.<Else|Elif>}
     */
    children: {
      value: [],
      enumerable: true,
    },
    valueOf: {
      value: function () {
        console.log("if valueOf");
        return {
          type: type.IF,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
        };
      },
    },
    preRender: {
      value: function () {
        var elifs, elseCondition;
        elifs = {};
        this.children.forEach(function (child) {
          if (child.type === type.ELIF) {
            elifs[child.variable] = child.children.map(function (subchild) {
              return subchild.preRender();
            });
          } else if (child.type === type.ELSE) {
            elseCondition = child.children.map(function (subchild) {
              return subchild.preRender();
            });
          } else {
            throw new Error("Invalid if context, only elif and else can be children of if.");
          }
        });
        return [Object.create({}, {
          elifs: {
            value: elifs,
          },
          else: {
            value: elseCondition,
          },
          /**
           * @param {Object=} opt_data
           * return {string}
           */
          toString: {
            value: function (opt_data) {
              var data, variable, variables, result, i;
              data = opt_data || {};
              variables = Object.keys(this.elifs);
              for (i = 0; i < variables.length; i++) {
                variable = variables[i];
                if (opt_data[variable]) {
                  return this.elifs[variable].toString(opt_data);
                }
              }
              if (this.elseCondition) {
                return this.elseCondition.toString(opt_data);
              }
              return "";
            },
          },
        })],
      },
    },
    /**
     * @param {Object=} opt_data
     * return {string}
     */
    toString: {
      value: function (opt_data) {
        throw new Error("Ifs cannot be strings");
      },
    },
  });
}

Elif = {};

/**
 * @param {string} name
 * @return {Elif}
 */
function createElif(name) {
  /**
   * @type {Elif}
   * @constructor
   */
  return Object.create(Elif, {
    /**
     * @type {string}
     */
    type: {
      value: type.ELIF,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    variable: {
      variable: "",
      writable: true,
      enumerable: true,
    },
    /**
     * @type {Array.<Object>}
     */
    children: {
      value: [],
      enumerable: true,
    },
    valueOf: {
      value: function () {
        return {
          type: type.ELIF,
          variable: this.variable,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
        };
      },
    },
  });
}

Else = {};

/**
 * @return {Else}
 */
function createElse() {
  /**
   * @type {Else}
   * @constructor
   */
  return Object.create(Else, {
    /**
     * @type {string}
     */
    type: {
      value: type.ELSE,
      enumerable: true,
    },
    /**
     * @type {Array.<Object>}
     */
    children: {
      value: [],
      enumerable: true,
    },
    valueOf: {
      value: function () {
        return {
          type: type.ELSE,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
        };
      },
    },
  });
}

module.exports = {
  If: If,
  Elif: Elif,
  Else: Else,
  createIf: createIf,
  createElif: createElif,
  createElse: createElse,
};
