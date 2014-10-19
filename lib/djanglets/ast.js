"use strict";
var visitor,
    Ast,
    computeDjtagTypes,
    signalDjtagTypes,
    djtagDeps,
    variable = require("./variable"),
    filter = require("./filter"),
    element = require("./element"),
    bool = require("./bool"),
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


Ast = {
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
  /**
   * @return {string}
   */
  getCurrentProcessState: function () {
    return this.state.processState[this.state.processState.length - 1];
  },
  /**
   * @param {string}
   */
  setProcessState: function (state) {
    this.state.processState.push(state);
  },
  /**
   * @return {string}
   */
  popProcessState: function () {
    return this.state.processState.pop();
  },
  states: {
    INITIAL: "INITIAL",
    ELEMENT: "ELEMENT",
    DJTAG: "DJTAG",
    ATTRIBUTE: "ATTRIBUTE",
  },
};

function createAst () {
  var instance;
  instance = Object.create(Ast, {
    initialize: {
      value: function () {
        this.state = {};
        Object.defineProperties(this.state, {
          currentText: {
            value: "",
            writable: true,
            enumerable: true,
          },
          nodeStack: {
            value: [],
            enumerable: true,
          },
          currentAttributes: {
            value: [],
            writable: true,
            enumerable: true,
          },
          processState: {
            value: [Ast.states.INITIAL],
            enumerable: true,
          },
          ast: {
            value: null,
            writable: true,
            enumerable: true,
          },
          djTagStack: {
            value: [],
            writable: true,
            enumerable: true,
          },
        });
        Object.seal(this.state);
      },
    },
    get: {
      value: function (ast) {
        return this.state.ast;
      }
    },
    valueOf: {
      value: function (ast) {
        var values;
        values = [];
        values = this.state.ast.map(function (ast) {
          return ast.valueOf(ast);
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
    var el, node;
    this.endText(ast);
    el = element.createElement();
    el.type = type.toUpperCase();
    if (!ast.state.ast) {
      ast.state.ast = [];
    }
    node = ast.getCurrentNode();
    if (!node) {
      if (type.toUpperCase() !== template.TEMPLATE_TYPE) {
        throw new Error("Root element must be a <template> element");
      }
      ast.state.ast.push(el);
    } else {
      node.children.push(el);
    }
    ast.addNodeToStack(el);
    ast.setProcessState(Ast.states.ELEMENT);
    this.endAttributes(ast);
    return el;
  },
  /**
   * @param {ast} ast
   */
  visitEndOpenTag: function (ast) {
    ast.popProcessState();
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
  visitDJTag: function (ast) {
    ast.setProcessState(Ast.states.DJTAG);
  },
  visitEndDJTag: function (ast) {
    var node = ast.getCurrentNode();
    switch (ast.state.djTagStack[0]) {
      case template.type.ENDIF:
        break;
      case template.type.ELSE:
        break;
      case template.type.ENDFOR:
        break;
      case template.type.IF:
        break;
      case template.type.ELIF:
        break;
      case template.type.FOR:
        break;
      default:
        break;
    }
    ast.popProcessState();
  },
  visitDJTagWord: function (ast, word) {
    ast.state.djTagStack.push(word);
  },
  visitInclude: function (ast) {
  },
  visitExtends: function (ast) {
  },
  visitBlock: function (ast) {
  },
  visitCustomDJTag: function (ast) {
  },
  visitCloseFor: function (ast) {
  },
  visitCloseIf: function (ast) {
  },
  visitCloseElif: function (ast) {
  },
  visitDJTagVariable: function (ast, name, filters) {
    return variable.createVariable(name, filters);
  },
  /**
   * @param {ast} ast
   * @param {string} name
   * @param {string?} arg
   * @return {Array.<filter>}
   */
  visitFilter: function (ast, name, arg) {
    return [filter.createFilter(name, arg)];
  },
  /**
   * @param {ast} ast
   * @param {Array.<filter>} filterA
   * @param {Array.<filter>} filterB
   * @return {Array.<filter>}
   */
  visitFilters: function (ast, filterA, filterB) {
    return filterA.concat(filterB);
  },
  visitItertator: function (ast, key, value, variable) {
  },
  /**
   * @param {ast} ast
   * @param {string} operator
   */
  visitExtendBoolean: function (ast, operator) {
    var currentBool = ast.getCurrentBool();
    switch (operator) {
      //Do something here.
    }
  },
  /**
   * @param {ast} ast
   * @param {boolean} not
   * @param {*} a
   * @param {string=} op
   * @param {*=} b
   */
  visitBooleanExpression: function (ast, not, a, op, b) {
    ast.addBool(bool.createBoolean(a, not, op, b));
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
  },
};



module.exports = {
  Ast: Ast,
  visitor: visitor,
  createAst: createAst,
};
