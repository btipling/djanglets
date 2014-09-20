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
 */
function buildTemplate(ast) {
  var name;
  name = ast.attributes[0].value;
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
