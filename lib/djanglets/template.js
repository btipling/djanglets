"use strict";
var type, TEMPLATE_TYPE;

/**
 * @enum {string}
 */
type = {
  ELEMENT: "ELEMENT",
  TEXT: "TEXT",
  VARIABLE: "VARIABLE",
  FOR: "FOR",
  IF: "IF",
  BLOCK: "BLOCK",
  EXTENDS: "EXTENDS",
};

/**
 * @param {Array?} opt_results
 * @param {Array|string|ast} pieces
 * @param {string} currentString
 */
function preRender (opt_results, pieces, currentString) {
  var results;

  results = opt_results || [];
  if (!opt_results) {
    pieces = pieces.preRender();
  }
  pieces.forEach(function (piece) {
    if (typeof piece === "string") {
      currentString += piece;
    } else {
      if (Object.prototype.toString.call(piece) === '[object Array]') {
        currentString = preRender(results, piece, currentString)[1];
      } else {
        if (currentString) {
          results.push(currentString);
        }
        currentString = "";
        results.push(piece);
      }
    }
  });
  if (!opt_results && currentString) {
    results.push(currentString);
  }
  return [results, currentString];
}

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
      value: preRender(null, ast, "")[0],
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
TEMPLATE_TYPE = "template";

module.exports = {
  type: type,
  TEMPLATE_TYPE: TEMPLATE_TYPE,
  buildTemplate: buildTemplate,
};
