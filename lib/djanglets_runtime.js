var djanglets =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var djanglets,
	    template = __webpack_require__(1),
	    ast = __webpack_require__(2);

	/**
	 * @param {ast} astObj
	 * @param {ast.visitor} visitor
	 * @param {Object} data
	 */
	function buildNode(astObj, visitor, data) {
	  if (typeof data === "string") {
	    visitor.visitText(astObj, data);
	    return;
	  }
	  switch (data.type) {
	    case template.type.ELEMENT:
	      visitor.visitOpenElement(astObj, data.name);
	      if (data.attributes) {
	        data.attributes.forEach(function (attribute) {
	          visitor.visitAttribute(astObj, attribute.name, attribute.value);
	        });
	      }
	      if (data.children) {
	        data.children.forEach(function (child) {
	          buildNode(astObj, visitor, child);
	        });
	      }
	      visitor.visitCloseElement(astObj);
	      break;
	    case template.type.VARIABLE:
	      visitor.visitVariable(astObj, data.name);
	      break;
	  }
	}

	/**
	 * @param {Array.<astObj>}
	 */
	function djanglets(templatesData) {
	  var astObj, visitor;
	  console.log(templatesData);
	  astObj = ast.createAst();
	  visitor = ast.visitor;
	  templatesData.forEach(function (data) {
	    buildNode(astObj, visitor, data);
	  }, this);
	  console.log("astObj", astObj.get());
	}

	module.exports = djanglets;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

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
	    variable = __webpack_require__(3),
	    element = __webpack_require__(4),
	    attribute = __webpack_require__(5),
	    template = __webpack_require__(1);


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
	  },
	  visitCloseElement: function (ast, type) {
	    this.endText(ast);
	    ast.state.currentAttributes.forEach(function (attr) {
	      ast.getCurrentNode().attributes.push(attr);
	    });
	    ast.state.currentAttributes = [];
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
	};



	module.exports = {
	  visitor: visitor,
	  createAst: createAst,
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Variable,
	    type = __webpack_require__(1).type;

	/**
	 * Prototype for Variable.
	 */
	Variable = {
	  /**
	   * @type {string}
	   * @private
	   */
	  name_: "",
	};

	/**
	 * @param {string} name
	 */
	function createVariable(name) {
	  var variable;
	  variable = Object.create(Variable, {
	    name: {
	      set: function (name) {
	        this.name_ = name.toLowerCase();
	      },
	      get: function () {
	        return this.name_;
	      },
	      enumerable: true,
	    },
	    valueOf: {
	      value: function () {
	        return {
	          type: type.VARIABLE,
	          name: this.name,
	        };
	      },
	    }
	  });
	  variable.name = name;
	  return variable;
	};

	module.exports = {
	  Variable: Variable,
	  createVariable: createVariable,
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Element,
	    type = __webpack_require__(1).type

	/**
	 * Element prototype.
	 */
	Element = {
	  /**
	   * @string
	   * @private
	   */
	  elementType_: "",
	};

	/**
	 * @return Element
	 */
	function createElement() {
	  return Object.create(Element, {
	    type: {
	      set: function (type) {
	        this.elementType_ = type.toLowerCase();
	      },
	      get: function () {
	        return this.elementType_;
	      },
	    },
	    attributes: {
	      enumberable: true,
	      value: [],
	    },
	    children: {
	      enumberable: true,
	      value: [],
	    },
	    /**
	     * @return {Object}
	     */
	    valueOf: {
	      value: function () {
	        var children, attributes, value;
	        children = this.children.map(function (child) {
	          return child.valueOf();
	        });
	        attributes = this.attributes.map(function (attr) {
	          return attr.valueOf();
	        });
	        value = {
	          type: type.ELEMENT,
	          name: this.type,
	        };
	        if (children.length) {
	          value.children = children;
	        }
	        if (attributes.length) {
	          value.attributes = attributes;
	        }
	        return value;
	      },
	    },
	  });
	}

	module.exports = {
	  Element: Element,
	  createElement: createElement,
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Attribute, 
	    type = __webpack_require__(1).type;

	/**
	 * Prototype for Attribute
	 */
	Attribute = {
	  /**
	   * @type {string}
	   * @private
	   */
	  name_: "",
	};

	function createAttribute() {
	  return Object.create(Attribute, {
	    name: {
	      set: function (name) {
	        this.name_ = name.toLowerCase();
	      },
	      get: function () {
	        return this.name_;
	      },
	      enumerable: true,
	    },
	    /**
	     * @type {string|Variable}
	     */
	    value: {
	      writable: true,
	    },
	    /**
	     * @return {Object}
	     */
	    valueOf: {
	      value: function () {
	        return {
	          value: this.value,
	          name: this.name,
	        };
	      },
	    },
	  });
	}

	module.exports = {
	  Attribute: Attribute,
	  createAttribute: createAttribute,
	};


/***/ }
/******/ ])