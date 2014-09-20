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
 * @param {ast} ast
 * @param {ast.visitor} visitor
 * @param {data}
 */
function buildTemplate(ast, visitor, data) {
  var ast, visitor, children;
  console.log("parseAst", data);
  buildNode(ast, visitor, data);
  return {
    name: name,
    ast: ast,
  };
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
