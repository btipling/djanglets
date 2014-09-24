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
    attribute = require("./attribute"),
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
signalDjtagTypes = [template.type.ELSE, template.type.ENDIF];
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
];
djtagDeps[template.type.ELIF] = [template.type.ELIF];
djtagDeps[template.type.ELSE] = [template.type.ELIF];
djtagDeps[template.type.ENDIF] = [template.type.ELIF, template.type.ELSE];


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
    this.endAttributes(ast);
    return el;
  },
  /**
   * @param {ast} ast
   * @param {string} type
   */
  visitCloseElement: function (ast, type) {
    this.endText(ast);
    ast.popNodeStack();
  },
  /**
   * @param {ast} ast
   * @param {string} type
   */
  visitSelfClosingElement: function (ast, type) {
    var el;
    el = this.visitOpenElement(ast, type);
    el.selfClosing = true;
    this.visitCloseElement(ast, type);
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
  visitComputeDjtag: function (ast, type, variable) {
    var node, tag;
    type = type.toUpperCase();
    console.log("visitComputeDjtag", type, variable);
    if (computeDjtagTypes.indexOf(type) === -1) {
      throw new Error(
        "Invalid (compute) djanglets tag type. Supported types: " + computeDjtagTypes.join(","));
    }
    node = ast.getCurrentNode();
    if (djtagDeps[type].indexOf(node.djangletType || node.type) === -1) {
      throw new Error(type + " cannot be a child of " + node.type);
    }
    switch (type) {
      case template.type.IF:
        //If statements wrap elif and ifs. The first if is just an elif.
        tag = ifTag.createIf();
        node.children.push(tag);
        ast.addNodeToStack(tag);
        node = tag;
        tag = ifTag.createElif(variable);
        node.children.push(tag);
        ast.addNodeToStack(tag);
        return;
      case template.type.ELIF:
        ast.popNodeStack(); //End the previous elif.
        tag = ifTag.createElif(variable);
        node = ast.getCurrentNode();
        node.children.push(tag);
        ast.addNodeToStack(tag);
        return;
    }
  },
  visitSignalDjtag: function (ast, type) {
    var node, tag;
    console.log("visitSignalDjtag", type);
    type = type.toUpperCase();
    if (signalDjtagTypes.indexOf(type) === -1) {
      throw new Error(
        "Invalid (signal) djanglets tag type. Supported types: " + signalDjtagTypes.join(","));
    }
    node = ast.getCurrentNode();
    if (djtagDeps[type].indexOf(node.djangletType || node.type) === -1) {
      throw new Error(type + " cannot be a child of " + node.type);
    }
    switch (type) {
      case template.type.ELSE:
        ast.popNodeStack(); //End the previous elif.
        tag = ifTag.createElse(variable);
        node = ast.getCurrentNode();
        node.children.push(tag);
        ast.addNodeToStack(tag);
        return;
      case template.type.ENDIF:
        ast.popNodeStack(); //End the previous elif or else.
        ast.popNodeStack(); //End the if.
        return;
    }
  },
};



module.exports = {
  visitor: visitor,
  createAst: createAst,
};
