"use strict";
var type;

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

module.exports = {
  type: type,
};
