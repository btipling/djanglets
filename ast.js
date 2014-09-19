"use strict";
/**
 * root
 *  \     \
 *   node  node
 *   \         \
 *   text node   node
 *
 *
 *   element - info about element (attributes, tag type)
 *   pointers
 *   \
 *
 *   textObj - value
 *
 *   attributes - name, value, if value is object it's a variable
 *
 *   variable
 *    - value
 *
 *
 *   ifConditial 
 *   - elif array -- checker(variable)
 *        - pointer if true
 *   - else - 
 *        - pointer if no elif did not get fired
 *   - does nothing if no else
 *
 *
 *   for (calls Object.keys for object, length on Array)
 *      pointer to its stuff
 *
 *   filters: separate filters property that is a bunch of functions and take arguments
 *   block: TODO
 *   include: TODO
 *   extends: TODO
 *   custom tags: TODO
 *   tag in attribute value: TODO
 *   variable or tag inside string in attribute value
 *
 *
 *   template tree -> execution tree (all vars ifs, fors turned into nodes and text)
 *
 *   if no existing tree, dump tree into HTML
 *
 *
 *   if existing tree, find differences, separate the difference into queue and dump those pieces
 *
 *
 *   dumping into HTML:
 *
 *    you create a template
 *    create instance of template, and give a containing element.
 *    define variables as arguments to `helpers` as per meteor
 *
 *  the end of this is a class, a class that checks its helpers for variable info.
 *
 *
 *
 */

var visitor,
    ast,
    variable = require("./variable"),
    element = require("./element"),
    attribute = require("./attribute");



ast = {
  /**
   * @param {Object} node
   */
  addNodeToStack: function (node) {
      this.state.nodeStack.push(node);
  },
  /**
   * @return {Object} node
   */
  getCurrentNode: function () {
    return this.state.nodeStack[this.state.nodeStack.length - 1];
  },
  /**
   * Reduce the node stack by one element.
   */
  popNodeStack: function () {
    this.state.nodeStack.pop();
  },
};

function createAst () {
  var instance;
  instance = Object.create(ast, {
    initialize: {
      value: function () {
        console.log("Initializing");
        this.state = {};
        Object.defineProperties(this.state, {
          nodeStack: {
            value: [],
          },
          currentAttributes: {
            value: [],
            writable: true,
          },
          ast: {
            value: null,
            writable: true,
          }
        });
      },
    },
    get: {
      value: function () {
        return this.state.ast;
      }
    },
  });
  instance.initialize();
  console.log("ast initalized", instance);
  return instance;
}

visitor = {
  /**
   * @type {string}
   */
  visitOpenElement: function (ast, type) {
    var el;
    el = element.createElement();
    el.type = type;
    if (!ast.state.ast) {
      ast.state.ast = el;
    } else {
      ast.getCurrentNode().children.push(el);
    }
    ast.addNodeToStack(el);
  },
  visitCloseElement: function (ast, type) {
    ast.state.currentAttributes.forEach(function (attr) {
      ast.getCurrentNode().attributes.push(attr);
    });
    ast.state.currentAttributes = [];
    ast.popNodeStack();
  },
  visitAttribute: function(ast, name, value) {
    var attr;
    attr = attribute.createAttribute();
    attr.name = name;
    attr.value = value;
    console.log(ast);
    ast.state.currentAttributes.push(attr);
    console.log("visiting attribute name", name, "value", value);
  },
  visitAttributeVariable: function(ast, name, variableName) {
    console.log("visiting attribute variable type", name, variableName);
  },
  visitText: function (ast, text) {
    console.log("visiting text", text);
  },
  visitVariable: function (ast, name) {
    console.log("visiting variable", name);
  },
};



module.exports = {
  visitor: visitor,
  createAst: createAst,
};
