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
  ATTRIBUTE: "ATTRIBUTE",
};

/**
 * @const
 * @type {string}
 */
TEMPLATE_TYPE = "template";

module.exports = {
  type: type,
  TEMPLATE_TYPE: TEMPLATE_TYPE,
};
