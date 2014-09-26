"use strict";
var type, TEMPLATE_TYPE,
    utils = require("./utils");

/**
 * @enum {string}
 */
type = {
  ELEMENT: "ELEMENT",
  TEXT: "TEXT",
  VARIABLE: "VARIABLE",
  FOR: "FOR",
  IN: "IN",
  ENDFOR: "ENDFOR",
  IF: "IF",
  ELIF: "ELIF",
  ELSE: "ELSE",
  ENDIF: "ENDIF",
  BLOCK: "BLOCK",
  EXTENDS: "EXTENDS",
  STRING: "STRING",
};

/**
 * @param {ast} ast
 */
function buildTemplate(ast) {
  var name;
  name = ast.attributes[0].value;
  return Object.create({
  }, { 
    /**
     * @type {Array.<string|Variable>}
     * @private
     */
    preRendered_: {
      value: (function () {
        var results = [];
        utils.flattenPreRender(results, ast.preRender());
        return results;
      }()),
    },
    name: {
      value: name,
      enumerable: true,
    },
    ast: {
      value: ast,
    },
    /**
     * @param {Object=}
     * @return {string}
     */
    toString: {
      value: function (opt_data) {
        var result;
        result = "";
        console.log("prerendered", this.preRendered_);
        this.preRendered_.forEach(function (piece) {
          result += piece.toString(opt_data);
        });
        return result;
      }
    }
  });
}

/**
 * @const
 * @type {string}
 */
TEMPLATE_TYPE = "TEMPLATE";

module.exports = {
  type: type,
  TEMPLATE_TYPE: TEMPLATE_TYPE,
  buildTemplate: buildTemplate,
};
