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
    attribute = require("./attribute"),
    template = require("./template");


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
        this.state = {};
        Object.defineProperties(this.state, {
          currentText: {
            value: "",
            writable: true,
          },
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
    valueOf: {
      value: function () {
        var values;
        values = [];
        values = this.state.ast.map(function (ast) {
          return ast.valueOf();
        });
        return values;
      },
    },
  });
  instance.initialize();
  return instance;
}

visitor = {
  /**
   * @throws {Error} If first element in a root is not a template element.
   * @type {string}
   */
  visitOpenElement: function (ast, type) {
    var el, node;
    this.endText(ast);
    el = element.createElement();
    el.type = type;
    if (!ast.state.ast) {
      ast.state.ast = [];
    }
    node = ast.getCurrentNode();
    if (!node) {
      if (type.toLowerCase() !== template.TEMPLATE_TYPE) {
        throw new Error("Root element must be a <template> element");
      }
      ast.state.ast.push(el);
    } else {
      node.children.push(el);
    }
    ast.addNodeToStack(el);
    this.endAttributes(ast);
  },
  visitCloseElement: function (ast, type) {
    this.endText(ast);
    ast.popNodeStack();
  },
  /**
   * @param {ast} ast
   * @param {string} name
   * @param {string} value
   */
  visitAttribute: function(ast, name, value) {
    var attr;
    attr = attribute.createAttribute();
    attr.name = name;
    attr.value = value;
    ast.state.currentAttributes.push(attr);
    //console.log("visiting attribute name", name, "value", value);
  },
  /**
   * @param {ast} ast
   * @param {string} name
   * @param {string} variableName
   */
  visitAttributeVariable: function(ast, name, variableName) {
    //console.log("visiting attribute variable type", name, variableName);
  },
  visitText: function (ast, text) {
    ast.state.currentText += text;
  },
  /**
   * @throws {Error} Can't be root node.
   * @param {ast} ast
   * @param {string} name
   */
  visitVariable: function (ast, name) {
    var node;
    this.endText(ast);
    node = ast.getCurrentNode();
    if (!node) {
      throw new Error("A variable can't be the root node.");
    }
    node.children.push(variable.createVariable(name));
  },
  /**
   * @throws {Error} endText should never be called if there's no current node.
   * @param {ast} ast
   */
  endText: function (ast) {
    var node;
    if (ast.state.currentText === "") {
      return;
    }
    node = ast.getCurrentNode();
    if (!node) {
      throw new Error("No node to add text to.");
    }
    node.children.push(ast.state.currentText);
    ast.state.currentText = "";
  },
  /**
   * @param {ast} ast
   */
  endAttributes: function (ast) {
    var node;
    node = ast.getCurrentNode();
    if (!node) {
      return;
    }
    ast.state.currentAttributes.forEach(function (attr) {
      node.attributes.push(attr);
    });
    ast.state.currentAttributes = [];
  },
};



module.exports = {
  visitor: visitor,
  createAst: createAst,
};
