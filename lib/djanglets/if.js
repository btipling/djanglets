"use strict";

var If, Elif, Else,
    utils = require("./utils"),
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
        return {
          type: type.IF,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
        };
      },
      enumerable: true,
    },
    preRender: {
      value: function () {
        var elifs, elseCondition;
        elifs = {};
        this.children.forEach(function (child) {
          var pieces, results = [];
          if (child.type === type.ELIF) {
            pieces = child.children.map(function (subchild) {
              if (subchild.hasOwnProperty("preRender")) {
                return subchild.preRender();
              } else {
                return subchild.toString();
              }
            });
            utils.flattenPreRender(results, pieces);
            elifs[child.variable] = results;
          } else if (child.type === type.ELSE) {
            pieces = child.children.map(function (subchild) {
              if (subchild.hasOwnProperty("preRender")) {
                return subchild.preRender();
              } else {
                return subchild.toString();
              }
            });
            utils.flattenPreRender(results, pieces);
            elseCondition = results;
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
                if (data[variable]) {
                  return this.elifs[variable].map(function (child) {
                    return child.toString(opt_data);
                  }).join("");
                }
              }
              if (this.else) {
                return this.else.toString(opt_data);
              }
              return "";
            },
          },
        })];
      },
      enumerable: true,
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
function createElif(bool) {
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
     * @type {bool}
     */
    variable: {
      value: bool,
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
