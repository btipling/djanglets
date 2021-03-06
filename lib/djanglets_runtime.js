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
	//something
	var djanglets,
	    template = __webpack_require__(1),
	    ast = __webpack_require__(2);

	/**
	 * @param {ast} astObj
	 * @param {ast.visitor} visitor
	 * @param {Object} data
	 */
	function buildNode(astObj, visitor, data) {
	  var child;
	  if (typeof data === "string") {
	    visitor.visitText(astObj, data);
	    return;
	  }
	  switch (data.type) {
	    case template.type.ELEMENT:
	      if (data.attributes) {
	        data.attributes.forEach(function (attribute) {
	          visitor.visitAttribute(astObj, attribute.name, attribute.value);
	        });
	      }
	      if (data.selfClosing) {
	        visitor.visitSelfClosingElement(astObj, data.name);
	        break;
	      }
	      visitor.visitOpenElement(astObj, data.name);
	      if (data.children) {
	        data.children.forEach(function (child) {
	          buildNode(astObj, visitor, child);
	        });
	      }
	      visitor.visitCloseElement(astObj);
	      break;
	    case template.type.IF:
	      child = data.children.shift();
	      visitor.visitComputeDjtag(astObj, template.type.IF, child.variable);
	      //Every if has an elif, as the if is actually an elif owend in an if object.
	      child.children.forEach(function (subChild) {
	        buildNode(astObj, visitor, subChild);
	      });
	      //Any other elif or final else.
	      data.children.forEach(function (child) {
	        buildNode(astObj, visitor, child);
	      });
	      visitor.visitSignalDjtag(astObj, template.type.ENDIF);
	      break;
	    case template.type.ELIF:
	      visitor.visitComputeDjtag(astObj, template.type.ELIF, data.variable);
	      data.children.forEach(function (child) {
	        buildNode(astObj, visitor, child);
	      });
	      break;
	    case template.type.ELSE:
	      visitor.visitSignalDjtag(astObj, template.type.ELSE);
	      data.children.forEach(function (child) {
	        buildNode(astObj, visitor, child);
	      });
	      break;
	    case template.type.FOR:
	      visitor.visitForDjtag(astObj, "for", data.key, data.value, "in", data.variable);
	      data.children.forEach(function (child) {
	        buildNode(astObj, visitor, child);
	      });
	      visitor.visitSignalDjtag(astObj, template.type.ENDFOR);
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
	  var astObj, visitor, templatesAst;
	  if (document.characterSet.toLowerCase() !== "utf-8") {
	    console.log([
	      "WARNING!",
	      "djanglets only works with the utf-8 characterSet,",
	      "add a <meta charset=\"utf-8\"> , your encoding:",
	      "'" + document.characterSet.toLowerCase() + "'",
	    ].join(" "));
	  }
	  console.log(templatesData);
	  astObj = ast.createAst();
	  visitor = ast.visitor;
	  templatesData.forEach(function (data) {
	    buildNode(astObj, visitor, data);
	  });
	  templatesAst = astObj.get();
	  djanglets.templates = [];
	  templatesAst.forEach(function (templateAst) {
	    var t;
	    t = template.buildTemplate(templateAst);
	    djanglets[t.name] = t;
	    djanglets.templates.push(t.name);
	  });
	}

	module.exports = djanglets;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var type, TEMPLATE_TYPE,
	    utils = __webpack_require__(3);

	/**
	 * @enum {string}
	 */
	type = {
	  ELEMENT: "ELEMENT",
	  TEXT: "TEXT",
	  VARIABLE: "VARIABLE",
	  FOR: "FOR",
	  IN: "IN",
	  ENDFOR: "ENDFOR",
	  IF: "IF",
	  ELIF: "ELIF",
	  ELSE: "ELSE",
	  ENDIF: "ENDIF",
	  BLOCK: "BLOCK",
	  EXTENDS: "EXTENDS",
	  STRING: "STRING",
	};

	/**
	 * @param {ast} ast
	 */
	function buildTemplate(ast) {
	  var name;
	  name = ast.attributes[0].value;
	  return Object.create({
	  }, { 
	    /**
	     * @type {Array.<string|Variable>}
	     * @private
	     */
	    preRendered_: {
	      value: (function () {
	        var results = [];
	        utils.flattenPreRender(results, ast.preRender());
	        return results;
	      }()),
	    },
	    name: {
	      value: name,
	      enumerable: true,
	    },
	    ast: {
	      value: ast,
	    },
	    /**
	     * @param {Object=}
	     * @return {string}
	     */
	    toString: {
	      value: function (opt_data) {
	        var result;
	        result = "";
	        this.preRendered_.forEach(function (piece) {
	          result += piece.toString(opt_data);
	        });
	        return result;
	      }
	    }
	  });
	}

	/**
	 * @const
	 * @type {string}
	 */
	TEMPLATE_TYPE = "TEMPLATE";

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
	    variable = __webpack_require__(4),
	    element = __webpack_require__(5),
	    ifTag = __webpack_require__(6),
	    forTag = __webpack_require__(7),
	    attribute = __webpack_require__(8),
	    entityLookup = __webpack_require__(9),
	    template = __webpack_require__(1);

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
	  },
	  /**
	   * @param {ast} ast
	   * @param {string} name
	   * @param {string} variableName
	   */
	  visitAttributeVariable: function(ast, name, variableName) {
	    //console.log("visiting attribute variable type", name, variableName);
	  },
	  /**
	   * @param {ast} ast
	   * @param {string} text
	   */
	  visitText: function (ast, text) {
	    ast.state.currentText += text;
	  },
	  /**
	   * @param {ast} ast
	   * @param {string} text
	   */
	  visitHTMLEntity: function (ast, entity) {
	    var replacement;
	    if (entityLookup.entities.hasOwnProperty(entity)) {
	      replacement = entityLookup.entities[entity];
	      console.log("Has!", entity, replacement);
	      this.visitText(ast, replacement);
	      return;
	    }
	    replacement = entityLookup.regexp.exec(entity);
	    if (replacement) {
	      return this.visitText(ast, replacement[1]);
	    }
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
	    this.endText(ast);
	    type = type.toUpperCase();
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
	    this.endText(ast);
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
	      case template.type.ENDFOR:
	        ast.popNodeStack();
	        return;
	    }
	  },
	  visitForDjtag: function(ast, type, key, value, inSep, variable) {
	    var node, forNode;
	    this.endText(ast);
	    type = type.toUpperCase();
	    inSep = inSep.toUpperCase();
	    key = key || "__KEY__";
	    if (type !== template.type.FOR || inSep !== template.type.IN) {
	      throw new Error([
	          "Invalid for loop. Template tag must \"for\" and use \"in\":",
	          "{% for k, v in %}",
	      ].join(" "));
	    }
	    node = ast.getCurrentNode();
	    if (djtagDeps[type].indexOf(node.djangletType || node.type) === -1) {
	      throw new Error(type + " cannot be a child of " + node.type);
	    }
	    forNode = forTag.createFor(key, value, variable);
	    node.children.push(forNode);
	    ast.addNodeToStack(forNode);
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

	var uniqueId,
	    meteorVariable = __webpack_require__(10);

	/**
	 * @type {number}
	 */
	uniqueId = 0;

	/**
	 * @return {string}
	 */
	function getUniqueId() {
	  uniqueId += 1;
	  return "" + uniqueId;
	}

	/**
	 * This function reduces multiple arrays into one, while concatonating strings. Strings
	 * are concatonated until we reach an object, like a variable or an if. Strings and objects 
	 * are put on the array, and then later, calling toString(DATA) on this will resolve
	 * variables and if statements into strings and concatonate it all up into a single string.
	 * @param {Array} results
	 * @param {Array|string|ast} pieces
	 * @param {string} currentString
	 * @return {Array<results, string>}
	 */
	function flattenPreRender_ (results, pieces, currentString) {
	  var results;

	  pieces.forEach(function (piece) {
	    if (typeof piece === "string") {
	      currentString += piece;
	    } else {
	      if (Object.prototype.toString.call(piece) === "[object Array]") {
	        /*
	         * We want to build strings until we hit an object like a variable or an if, so we
	         * modify `results`, while also returning currentString because we may be building
	         * up this string some more inside the next recursive call to flattenPreRender.
	         *
	         * XXX: This recursion could blow up if the stack got too big, it would have to be
	         * pretty big I think.
	         */
	        currentString = flattenPreRender_(results, piece, currentString);
	      } else {
	        if (currentString) {
	          results.push(currentString);
	        }
	        currentString = "";
	        results.push(piece);
	      }
	    }
	  });
	  return currentString;
	}

	/**
	 * @param {Array} results
	 * @param {Array} pieces
	 */
	function flattenPreRender (results, pieces) {
	  var finalString = flattenPreRender_(results, pieces, "");
	  if (finalString) {
	    results.push(finalString);
	  }
	}

	/**
	 * Walk up data context to find the variable.
	 * @param {string} name
	 * @param {Object} data
	 * @return {*|Error} Returns an error if not found.
	 */
	function getVariable_ (name, data) {
	  var result;
	  if (data.hasOwnProperty(name)) {
	    if (meteorVariable.Variable.isPrototypeOf(data[name])) {
	      return data[name].value;
	    }
	    return data[name];
	  }
	  if (data.__context__) {
	    return getVariable(name, data.__context__);
	  }
	  return new Error("Not found");
	}

	/**
	 * @param {Array.<string>} namespaces
	 * @param {Object} data
	 * @return {*|Error}
	 */
	function searchForNamespace (namespaces, data) {
	  var result, currentPath;
	  namespaces = [].concat(namespaces); //Create new array to modify given one.
	  currentPath = namespaces.shift();
	  result = getVariable_(currentPath, data);
	  if (Error.prototype.isPrototypeOf(result) || !namespaces.length) {
	    return result;
	  }
	  if (Object.prototype.toString.call(result) !== "[object Object]") {
	    return new Error("Not found");
	  }
	  return searchForNamespace(namespaces, result);
	}

	/**
	 * @param {Array.<string>} namespaces
	 * @param {Array.<Object>} datas
	 * @return {*|Error}
	 */
	function searchForData (namespaces, datas) {
	  var result, data;
	  datas = [].concat(datas); //Clone array to not modify it.
	  data = datas.shift();
	  result = searchForNamespace([].concat(namespaces), data);
	  if (!Error.prototype.isPrototypeOf(result) || !datas.length) {
	    return result;
	  }
	  return searchForData(namespaces, datas);
	}

	/**
	 * @param {string} name
	 * @param {Array.<Object>|Object} datas
	 */
	function getVariable (name, datas) {
	  var result;
	  if (Object.prototype.toString.call(datas) !== "[object Array]") {
	    datas = [datas];
	  }
	  result = searchForData(name.split("."), datas);
	  return result;
	}

	module.exports = {
	  flattenPreRender: flattenPreRender,
	  getUniqueId: getUniqueId,
	  getVariable: getVariable,
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Variable,
	    escapes,
	    utils = __webpack_require__(3),
	    type = __webpack_require__(1).type;

	/**
	 * @enum {Object.<string, RegExp>}
	 */
	escapes = {
	  "&amp;": /&/g,
	  "&lt;": /</g,
	  "&gt;": />/g,
	  "&quot;": /"/g,
	  "&#39;": /'/g,
	};

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
	        this.name_ = name;
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
	    },
	    /**
	     * @param {Object=} opt_data
	     * return {string}
	     */
	    toString: {
	      value: function (opt_data) {
	        var result = utils.getVariable(this.name, opt_data || {});
	        if (Error.prototype.isPrototypeOf(result)) {
	          return "";
	        }
	        return this.escape("" + result);
	      },
	    },
	    /**
	     * @return {Variable}
	     */
	    preRender: {
	      value: function () {
	        return [this];
	      },
	      enumerable: true,
	    },
	    /**
	     * @param {string}
	     * @return {string}
	     */
	    escape: {
	      value: function (text) {
	        var keys;
	        keys = Object.keys(escapes);
	        keys.forEach(function (safe) {
	          var unsafe;
	          unsafe = escapes[safe];
	          text = text.replace(unsafe, safe);
	        });
	        return text;
	      }
	    },
	  });
	  variable.name = name;
	  return variable;
	};

	module.exports = {
	  Variable: Variable,
	  createVariable: createVariable,
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Element,
	    utils = __webpack_require__(3),
	    template = __webpack_require__(1);

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
	    /**
	     * @type {string}
	     */
	    id: {
	      value: "djlt." + utils.getUniqueId(),
	    },
	    djangletType: {
	      value: template.type.ELEMENT,
	    },
	    type: {
	      set: function (type) {
	        this.elementType_ = type.toUpperCase();
	      },
	      get: function () {
	        return this.elementType_;
	      },
	      enumerable: true,
	    },
	    /**
	     * @type {boolean}
	     */
	    selfClosing: {
	      value: false,
	      writable: true,
	      enuerable: true,
	    },
	    /**
	     * @type {Array.<Attribute>}
	     */
	    attributes: {
	      enumberable: true,
	      value: [],
	    },
	    /**
	     * @type {Array.<string|Variable|Element>}
	     */
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
	          id: this.id,
	          type: template.type.ELEMENT,
	          name: this.type,
	        };
	        if (this.selfClosing) {
	          value.selfClosing = true;
	        }
	        if (children.length) {
	          value.children = children;
	        }
	        if (attributes.length) {
	          value.attributes = attributes;
	        }
	        return value;
	      },
	    },
	    /**
	     * @return {Array}
	     */
	    preRender: {
	      value: function () {
	        var children, results;
	        children = [];
	        this.children.forEach(function (child) {
	          if (child.hasOwnProperty("preRender")) {
	            children = children.concat(child.preRender());
	          } else {
	            children.push(child.toString());
	          }
	        });
	        if (this.type === template.TEMPLATE_TYPE) {
	          return children;
	        }
	        results = [];
	        utils.flattenPreRender(results, children);
	        return [Object.create({}, {
	          type: {
	            value: this.type,
	          },
	          attributes: {
	            value: this.attributes,
	          },
	          children: {
	            value: results,
	          },
	          selfClosing: {
	            value: this.selfClosing,
	          },
	          /**
	           * @param {*=} opt_data
	           * @return {string}
	           */
	          toString: {
	            value: function (opt_data) {
	              var result, id, resultId;
	              result  = ["<", this.type];
	              this.attributes.forEach(function (attr) {
	                result.push(" ");
	                result.push(attr.name);
	                result.push("=\"");
	                result.push(attr.value);
	                result.push("\"");
	              });
	              if (this.selfClosing) {
	                result.push("/>");
	                return result.join("");
	              }
	              result.push(">");
	              result = result.concat(this.children.map(function (child) {
	                if (typeof child === "string") {
	                  return child;
	                }
	                return child.toString(opt_data);
	              }));
	              result.push("</");
	              result.push(this.type);
	              result.push(">");
	              return result.join("");
	            },
	            enumerable: true,
	          },
	        })];
	      },
	    },
	  });
	}

	module.exports = {
	  Element: Element,
	  createElement: createElement,
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var If, Elif, Else,
	    utils = __webpack_require__(3),
	    type = __webpack_require__(1).type;

	If = {};

	function createIf() {
	  return Object.create(If, {
	    /**
	     * @type {string}
	     */
	    type: {
	      value: type.IF,
	      enumerable: true,
	    },
	    /**
	     * @type {Array.<Else|Elif>}
	     */
	    children: {
	      value: [],
	      enumerable: true,
	    },
	    valueOf: {
	      value: function () {
	        return {
	          type: type.IF,
	          children: this.children.map(function (child) {
	            return child.valueOf();
	          }),
	        };
	      },
	      enumerable: true,
	    },
	    preRender: {
	      value: function () {
	        var elifs, elseCondition;
	        elifs = {};
	        this.children.forEach(function (child) {
	          var pieces, results = [];
	          if (child.type === type.ELIF) {
	            pieces = child.children.map(function (subchild) {
	              if (subchild.hasOwnProperty("preRender")) {
	                return subchild.preRender();
	              } else {
	                return subchild.toString();
	              }
	            });
	            utils.flattenPreRender(results, pieces);
	            elifs[child.variable] = results;
	          } else if (child.type === type.ELSE) {
	            pieces = child.children.map(function (subchild) {
	              if (subchild.hasOwnProperty("preRender")) {
	                return subchild.preRender();
	              } else {
	                return subchild.toString();
	              }
	            });
	            utils.flattenPreRender(results, pieces);
	            elseCondition = results;
	          } else {
	            throw new Error("Invalid if context, only elif and else can be children of if.");
	          }
	        });
	        return [Object.create({}, {
	          elifs: {
	            value: elifs,
	          },
	          else: {
	            value: elseCondition,
	          },
	          /**
	           * @param {Object=} opt_data
	           * return {string}
	           */
	          toString: {
	            value: function (opt_data) {
	              var data, variable, variables, result, i;
	              data = opt_data || {};
	              variables = Object.keys(this.elifs);
	              for (i = 0; i < variables.length; i++) {
	                variable = variables[i];
	                if (data[variable]) {
	                  return this.elifs[variable].map(function (child) {
	                    return child.toString(opt_data);
	                  }).join("");
	                }
	              }
	              if (this.else) {
	                return this.else.toString(opt_data);
	              }
	              return "";
	            },
	          },
	        })];
	      },
	      enumerable: true,
	    },
	    /**
	     * @param {Object=} opt_data
	     * return {string}
	     */
	    toString: {
	      value: function (opt_data) {
	        throw new Error("Ifs cannot be strings");
	      },
	    },
	  });
	}

	Elif = {};

	/**
	 * @param {string} name
	 * @return {Elif}
	 */
	function createElif(name) {
	  /**
	   * @type {Elif}
	   * @constructor
	   */
	  return Object.create(Elif, {
	    /**
	     * @type {string}
	     */
	    type: {
	      value: type.ELIF,
	      enumerable: true,
	    },
	    /**
	     * @type {string}
	     */
	    variable: {
	      value: name,
	      enumerable: true,
	    },
	    /**
	     * @type {Array.<Object>}
	     */
	    children: {
	      value: [],
	      enumerable: true,
	    },
	    valueOf: {
	      value: function () {
	        return {
	          type: type.ELIF,
	          variable: this.variable,
	          children: this.children.map(function (child) {
	            return child.valueOf();
	          }),
	        };
	      },
	    },
	  });
	}

	Else = {};

	/**
	 * @return {Else}
	 */
	function createElse() {
	  /**
	   * @type {Else}
	   * @constructor
	   */
	  return Object.create(Else, {
	    /**
	     * @type {string}
	     */
	    type: {
	      value: type.ELSE,
	      enumerable: true,
	    },
	    /**
	     * @type {Array.<Object>}
	     */
	    children: {
	      value: [],
	      enumerable: true,
	    },
	    valueOf: {
	      value: function () {
	        return {
	          type: type.ELSE,
	          children: this.children.map(function (child) {
	            return child.valueOf();
	          }),
	        };
	      },
	    },
	  });
	}

	module.exports = {
	  If: If,
	  Elif: Elif,
	  Else: Else,
	  createIf: createIf,
	  createElif: createElif,
	  createElse: createElse,
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var For,
	    utils = __webpack_require__(3),
	    type = __webpack_require__(1).type;

	For = {};

	/**
	 * @param {string} key
	 * @param {string} value
	 * @param {string} variable
	 * @return {For}
	 */
	function createFor(key, value, variable) {
	  /**
	   * @type {For}
	   * @constructor
	   */
	  return Object.create(For, {
	    /**
	     * @type {string}
	     */
	    type: {
	      value: type.FOR,
	      enumerable: true,
	    },
	    /**
	     * @type {string}
	     */
	    key: {
	      value: key,
	      enumerable: true,
	    },
	    /**
	     * @type {string}
	     */
	    value: {
	      value: value,
	      enumerable: true,
	    },
	    /**
	     * @type {string}
	     */
	    variable: {
	      value: variable,
	      enumerable: true,
	    },
	    /**
	     * @type {Array.<Object>}
	     */
	    children: {
	      value: [],
	      enumerable: true,
	    },
	    valueOf: {
	      value: function () {
	        return {
	          type: type.FOR,
	          children: this.children.map(function (child) {
	            return child.valueOf();
	          }),
	          key: this.key,
	          value: this.value,
	          variable: this.variable,
	        };
	      },
	      enumerable: true,
	    },
	    preRender: {
	      value: function () {
	        var results = [], pieces;
	        pieces = this.children.map(function (subchild) {
	          if (subchild.hasOwnProperty("preRender")) {
	            return subchild.preRender();
	          } else {
	            return subchild.toString();
	          }
	        }, this);
	        utils.flattenPreRender(results, pieces);
	        return [Object.create({}, {
	          /**
	           * @type {Array.<Object>}
	           */
	          children: {
	            value: results,
	            enumerable: true,
	          },
	          /**
	           * @type {string}
	           */
	          key: {
	            value: this.key,
	            enumerable: true,
	          },
	          /**
	           * @type {string}
	           */
	          value: {
	            value: this.value,
	            enumerable: true,
	          },
	          /**
	           * @type {string}
	           */
	          variable: {
	            value: this.variable,
	            enumerable: true,
	          },
	          /**
	           * @param {*=} opt_data
	           * @return {string}
	           */
	          toString: {
	            value: function (opt_data) {
	              var results = [], data, loopData, idCount = 0, keys;
	              data = opt_data || {};
	              loopData = utils.getVariable(this.variable, data);
	              if (Error.prototype.isPrototypeOf(loopData)) {
	                return "";
	              }
	              switch(Object.prototype.toString.call(loopData)) {
	                case "[object Array]":
	                  return loopData.map(function (value, index) {
	                    var childData, key, results;
	                    key = "" + index;
	                    childData = {__context__: data};
	                    childData[this.key] = key;
	                    childData[this.value] = value;
	                    results = this.children.map(function (child) {
	                      return child.toString(childData);
	                    }).join("");
	                    idCount++;
	                    return results;
	                  }, this).join("");
	                case "[object Object]":
	                  keys = Object.keys(loopData);
	                  keys.forEach(function (key) {
	                    var childData = {__context__: data};
	                    childData[this.key] = key;
	                    childData[this.value] = loopData[key];
	                    results = results.concat(this.children.map(function (child) {
	                      return child.toString(childData);
	                    }));
	                    idCount++;
	                  }, this);
	                  return results.join("");
	              }
	              return "";
	            },
	          },
	        })];
	      },
	      enumerable: true,
	    },
	  });
	}

	module.exports = {
	  For: For,
	  createFor: createFor,
	};


/***/ },
/* 8 */
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


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var entities, regexp;

	entities = {
	  "&apos;"     : "\u0027",
	  "&quot;"     : "\u0022",
	  "&amp;"      : "\u0026",
	  "&lt;"       : "\u003C",
	  "&gt;"       : "\u003E",
	  "&nbsp;"     : "\u00A0",
	  "&iexcl;"    : "\u00A1",
	  "&cent;"     : "\u00A2",
	  "&pound;"    : "\u00A3",
	  "&curren;"   : "\u00A4",
	  "&yen;"      : "\u00A5",
	  "&brvbar;"   : "\u00A6",
	  "&sect;"     : "\u00A7",
	  "&uml;"      : "\u00A8",
	  "&copy;"     : "\u00A9",
	  "&ordf;"     : "\u00AA",
	  "&laquo;"    : "\u00AB",
	  "&not;"      : "\u00AC",
	  "&shy;"      : "\u00AD",
	  "&reg;"      : "\u00AE",
	  "&macr;"     : "\u00AF",
	  "&deg;"      : "\u00B0",
	  "&plusmn;"   : "\u00B1",
	  "&sup2;"     : "\u00B2",
	  "&sup3;"     : "\u00B3",
	  "&acute;"    : "\u00B4",
	  "&micro;"    : "\u00B5",
	  "&para;"     : "\u00B6",
	  "&middot;"   : "\u00B7",
	  "&cedil;"    : "\u00B8",
	  "&sup1;"     : "\u00B9",
	  "&ordm;"     : "\u00BA",
	  "&raquo;"    : "\u00BB",
	  "&frac14;"   : "\u00BC",
	  "&frac12;"   : "\u00BD",
	  "&frac34;"   : "\u00BE",
	  "&iquest;"   : "\u00BF",
	  "&Agrave;"   : "\u00C0",
	  "&Aacute;"   : "\u00C1",
	  "&Acirc;"    : "\u00C2",
	  "&Atilde;"   : "\u00C3",
	  "&Auml;"     : "\u00C4",
	  "&Aring;"    : "\u00C5",
	  "&AElig;"    : "\u00C6",
	  "&Ccedil;"   : "\u00C7",
	  "&Egrave;"   : "\u00C8",
	  "&Eacute;"   : "\u00C9",
	  "&Ecirc;"    : "\u00CA",
	  "&Euml;"     : "\u00CB",
	  "&Igrave;"   : "\u00CC",
	  "&Iacute;"   : "\u00CD",
	  "&Icirc;"    : "\u00CE",
	  "&Iuml;"     : "\u00CF",
	  "&ETH;"      : "\u00D0",
	  "&Ntilde;"   : "\u00D1",
	  "&Ograve;"   : "\u00D2",
	  "&Oacute;"   : "\u00D3",
	  "&Ocirc;"    : "\u00D4",
	  "&Otilde;"   : "\u00D5",
	  "&Ouml;"     : "\u00D6",
	  "&times;"    : "\u00D7",
	  "&Oslash;"   : "\u00D8",
	  "&Ugrave;"   : "\u00D9",
	  "&Uacute;"   : "\u00DA",
	  "&Ucirc;"    : "\u00DB",
	  "&Uuml;"     : "\u00DC",
	  "&Yacute;"   : "\u00DD",
	  "&THORN;"    : "\u00DE",
	  "&szlig;"    : "\u00DF",
	  "&agrave;"   : "\u00E0",
	  "&aacute;"   : "\u00E1",
	  "&acirc;"    : "\u00E2",
	  "&atilde;"   : "\u00E3",
	  "&auml;"     : "\u00E4",
	  "&aring;"    : "\u00E5",
	  "&aelig;"    : "\u00E6",
	  "&ccedil;"   : "\u00E7",
	  "&egrave;"   : "\u00E8",
	  "&eacute;"   : "\u00E9",
	  "&ecirc;"    : "\u00EA",
	  "&euml;"     : "\u00EB",
	  "&igrave;"   : "\u00EC",
	  "&iacute;"   : "\u00ED",
	  "&icirc;"    : "\u00EE",
	  "&iuml;"     : "\u00EF",
	  "&eth;"      : "\u00F0",
	  "&ntilde;"   : "\u00F1",
	  "&ograve;"   : "\u00F2",
	  "&oacute;"   : "\u00F3",
	  "&ocirc;"    : "\u00F4",
	  "&otilde;"   : "\u00F5",
	  "&ouml;"     : "\u00F6",
	  "&divide;"   : "\u00F7",
	  "&oslash;"   : "\u00F8",
	  "&ugrave;"   : "\u00F9",
	  "&uacute;"   : "\u00FA",
	  "&ucirc;"    : "\u00FB",
	  "&uuml;"     : "\u00FC",
	  "&yacute;"   : "\u00FD",
	  "&thorn;"    : "\u00FE",
	  "&yuml;"     : "\u00FF",
	  "&OElig;"    : "\u0152",
	  "&oelig;"    : "\u0153",
	  "&Scaron;"   : "\u0160",
	  "&scaron;"   : "\u0161",
	  "&Yuml;"     : "\u0178",
	  "&fnof;"     : "\u0192",
	  "&circ;"     : "\u02C6",
	  "&tilde;"    : "\u02DC",
	  "&Alpha;"    : "\u0391",
	  "&Beta;"     : "\u0392",
	  "&Gamma;"    : "\u0393",
	  "&Delta;"    : "\u0394",
	  "&Epsilon;"  : "\u0395",
	  "&Zeta;"     : "\u0396",
	  "&Eta;"      : "\u0397",
	  "&Theta;"    : "\u0398",
	  "&Iota;"     : "\u0399",
	  "&Kappa;"    : "\u039A",
	  "&Lambda;"   : "\u039B",
	  "&Mu;"       : "\u039C",
	  "&Nu;"       : "\u039D",
	  "&Xi;"       : "\u039E",
	  "&Omicron;"  : "\u039F",
	  "&Pi;"       : "\u03A0",
	  "&Rho;"      : "\u03A1",
	  "&Sigma;"    : "\u03A3",
	  "&Tau;"      : "\u03A4",
	  "&Upsilon;"  : "\u03A5",
	  "&Phi;"      : "\u03A6",
	  "&Chi;"      : "\u03A7",
	  "&Psi;"      : "\u03A8",
	  "&Omega;"    : "\u03A9",
	  "&alpha;"    : "\u03B1",
	  "&beta;"     : "\u03B2",
	  "&gamma;"    : "\u03B3",
	  "&delta;"    : "\u03B4",
	  "&epsilon;"  : "\u03B5",
	  "&zeta;"     : "\u03B6",
	  "&eta;"      : "\u03B7",
	  "&theta;"    : "\u03B8",
	  "&iota;"     : "\u03B9",
	  "&kappa;"    : "\u03BA",
	  "&lambda;"   : "\u03BB",
	  "&mu;"       : "\u03BC",
	  "&nu;"       : "\u03BD",
	  "&xi;"       : "\u03BE",
	  "&omicron;"  : "\u03BF",
	  "&pi;"       : "\u03C0",
	  "&rho;"      : "\u03C1",
	  "&sigmaf;"   : "\u03C2",
	  "&sigma;"    : "\u03C3",
	  "&tau;"      : "\u03C4",
	  "&upsilon;"  : "\u03C5",
	  "&phi;"      : "\u03C6",
	  "&chi;"      : "\u03C7",
	  "&psi;"      : "\u03C8",
	  "&omega;"    : "\u03C9",
	  "&thetasym;" : "\u03D1",
	  "&upsih;"    : "\u03D2",
	  "&piv;"      : "\u03D6",
	  "&ensp;"     : "\u2002",
	  "&emsp;"     : "\u2003",
	  "&thinsp;"   : "\u2009",
	  "&zwnj;"     : "\u200C",
	  "&zwj;"      : "\u200D",
	  "&lrm;"      : "\u200E",
	  "&rlm;"      : "\u200F",
	  "&ndash;"    : "\u2013",
	  "&mdash;"    : "\u2014",
	  "&lsquo;"    : "\u2018",
	  "&rsquo;"    : "\u2019",
	  "&sbquo;"    : "\u201A",
	  "&ldquo;"    : "\u201C",
	  "&rdquo;"    : "\u201D",
	  "&bdquo;"    : "\u201E",
	  "&dagger;"   : "\u2020",
	  "&Dagger;"   : "\u2021",
	  "&bull;"     : "\u2022",
	  "&hellip;"   : "\u2026",
	  "&permil;"   : "\u2030",
	  "&prime;"    : "\u2032",
	  "&Prime;"    : "\u2033",
	  "&lsaquo;"   : "\u2039",
	  "&rsaquo;"   : "\u203A",
	  "&oline;"    : "\u203E",
	  "&frasl;"    : "\u2044",
	  "&euro;"     : "\u20AC",
	  "&image;"    : "\u2111",
	  "&weierp;"   : "\u2118",
	  "&real;"     : "\u211C",
	  "&trade;"    : "\u2122",
	  "&alefsym;"  : "\u2135",
	  "&larr;"     : "\u2190",
	  "&uarr;"     : "\u2191",
	  "&rarr;"     : "\u2192",
	  "&darr;"     : "\u2193",
	  "&harr;"     : "\u2194",
	  "&crarr;"    : "\u21B5",
	  "&lArr;"     : "\u21D0",
	  "&uArr;"     : "\u21D1",
	  "&rArr;"     : "\u21D2",
	  "&dArr;"     : "\u21D3",
	  "&hArr;"     : "\u21D4",
	  "&forall;"   : "\u2200",
	  "&part;"     : "\u2202",
	  "&exist;"    : "\u2203",
	  "&empty;"    : "\u2205",
	  "&nabla;"    : "\u2207",
	  "&isin;"     : "\u2208",
	  "&notin;"    : "\u2209",
	  "&ni;"       : "\u220B",
	  "&prod;"     : "\u220F",
	  "&sum;"      : "\u2211",
	  "&minus;"    : "\u2212",
	  "&lowast;"   : "\u2217",
	  "&radic;"    : "\u221A",
	  "&prop;"     : "\u221D",
	  "&infin;"    : "\u221E",
	  "&ang;"      : "\u2220",
	  "&and;"      : "\u2227",
	  "&or;"       : "\u2228",
	  "&cap;"      : "\u2229",
	  "&cup;"      : "\u222A",
	  "&int;"      : "\u222B",
	  "&there4;"   : "\u2234",
	  "&sim;"      : "\u223C",
	  "&cong;"     : "\u2245",
	  "&asymp;"    : "\u2248",
	  "&ne;"       : "\u2260",
	  "&equiv;"    : "\u2261",
	  "&le;"       : "\u2264",
	  "&ge;"       : "\u2265",
	  "&sub;"      : "\u2282",
	  "&sup;"      : "\u2283",
	  "&nsub;"     : "\u2284",
	  "&sube;"     : "\u2286",
	  "&supe;"     : "\u2287",
	  "&oplus;"    : "\u2295",
	  "&otimes;"   : "\u2297",
	  "&perp;"     : "\u22A5",
	  "&sdot;"     : "\u22C5",
	  "&lceil;"    : "\u2308",
	  "&rceil;"    : "\u2309",
	  "&lfloor;"   : "\u230A",
	  "&rfloor;"   : "\u230B",
	  "&lang;"     : "\u2329",
	  "&rang;"     : "\u232A",
	  "&loz;"      : "\u25CA",
	  "&spades;"   : "\u2660",
	  "&clubs;"    : "\u2663",
	  "&hearts;"   : "\u2665",
	  "&diams;"    : "\u2666",
	};

	regexp = /&#x(\d+);/

	module.exports = {
	  entities: entities,
	  regexp: regexp,
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Variable = {};

	/**
	 * @param {string} name
	 * @return {MeteorVariable}
	 */
	function createVariable(name) {
	  if (!name) {
	    throw "A live meteor variable needs a name";
	  }
	  /**
	   * @type {MeteorVariable}
	   * @constructor
	   */
	  return Object.create(Variable, {
	    name: {
	      value: name,
	    },
	    tracker: {
	      value: null,
	      writable: true,
	      enumerable: true,
	    },
	    value: {
	      value: null,
	      writable: true,
	      enumerable: true,
	    },
	  });
	}

	module.exports = {
	  createVariable: createVariable,
	  Variable: Variable,
	};


/***/ }
/******/ ])