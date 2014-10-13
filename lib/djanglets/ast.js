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
 *   djtag: TODO
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
    computeDjtagTypes,
    signalDjtagTypes,
    djtagDeps,
    variable = require("./variable"),
    element = require("./element"),
    ifTag = require("./if"),
    forTag = require("./for"),
    attribute = require("./attribute"),
    entityLookup = require("./entity"),
    template = require("./template");

/**
 * A list of possible compute djanglet tag types.
 * @type {Array.<string>}
 */
computeDjtagTypes = [template.type.IF, template.type.ELIF];
/**
 * A list of possible signal djanglet tag types.
 * @type {Array.<string>}
 */
signalDjtagTypes = [
  template.type.ELSE,
  template.type.ENDIF,
  template.type.ENDFOR,
];
/**
 * A map of djanglet tag type parent requirements. Some compute types can only be
 * children of certain types of tags.
 * @type {Object.<string, Array.<string>>}
 */
djtagDeps = {};
djtagDeps[template.type.IF] = [
  template.TEMPLATE_TYPE,
  template.type.ELEMENT,
  template.type.ELIF,
  template.type.ELSE,
  template.type.FOR,
];
djtagDeps[template.type.FOR] = djtagDeps[template.type.IF];
djtagDeps[template.type.ELIF] = [template.type.ELIF];
djtagDeps[template.type.ELSE] = [template.type.ELIF];
djtagDeps[template.type.ENDIF] = [template.type.ELIF, template.type.ELSE];
djtagDeps[template.type.ENDFOR] = [template.type.FOR];


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
   * @param {ast} ast
   * @param {string} type
   * @throws {Error} If first element in a root is not a template element.
   * @return {Element}
   */
  visitOpenElement: function (ast, type) {
  },
  /**
   * @param {ast} ast
   * @param {string} type
   */
  visitCloseElement: function (ast, type) {
  },
  /**
   * @param {ast} ast
   * @param {string} type
   */
  visitSelfClosingElement: function (ast, type) {
  },
  /**
   * @param {ast} ast
   * @param {string} name
   * @param {string} value
   */
  visitAttribute: function(ast, name, value) {
  },
  visitAttributeContent: function (ast, content) {
  },
  visitEndAttribute: function (ast) {
  },
  /**
   * @param {ast} ast
   * @param {string} text
   */
  visitText: function (ast, text) {
  },
  /**
   * @param {ast} ast
   * @param {string} text
   */
  visitHTMLEntity: function (ast, entity) {
  },
  /**
   * @throws {Error} Can't be root node.
   * @param {ast} ast
   * @param {string} name
   */
  visitVariable: function (ast, name) {
  },
  visitDJTag: function () {
  },
  visitEndDJTag: function () {
  },
  visitDJTagWord: function () {
  },
  visitInclude: function () {
  },
  visitExtends: function () {
  },
  visitCustomDJTag: function () {
  },
  visitCloseFor: function () {
  },
  visitCloseIf: function () {
  },
  visitCloseElif: function () {
  },
  visitDJTagVariable: function () {
    //return something.
  },
  visitFilter: function () {
  },
  visitItertator: function () {
  },
  visitCloseBoolean: function () {
  },
  visitBooleanExpression: function () {
  },
  /**
   * @throws {Error} endText should never be called if there's no current node.
   * @param {ast} ast
   */
  endText: function (ast) {
  },
  /**
   * @param {ast} ast
   */
  endAttributes: function (ast) {
  },
};



module.exports = {
  visitor: visitor,
  createAst: createAst,
};
