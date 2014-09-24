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

	var runtime = __webpack_require__(1),
	    template = __webpack_require__(7);

	djanglets = function () {
	  runtime.apply(this, arguments);
	  djanglets.templates = runtime.templates;
	  djanglets.templates.forEach(function (templateName) {
	    djanglets[templateName] = template.create(runtime[templateName]);
	  });
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	//something
	var djanglets,
	    template = __webpack_require__(2),
	    ast = __webpack_require__(3);

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
/* 2 */
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
	 * @param {Array?} opt_results
	 * @param {Array|string|ast} pieces
	 * @param {string} currentString
	 */
	function preRender (opt_results, pieces, currentString) {
	  var results;

	  results = opt_results || [];
	  if (!opt_results) {
	    pieces = pieces.preRender();
	  }
	  pieces.forEach(function (piece) {
	    if (typeof piece === "string") {
	      currentString += piece;
	    } else {
	      if (Object.prototype.toString.call(piece) === '[object Array]') {
	        currentString = preRender(results, piece, currentString)[1];
	      } else {
	        if (currentString) {
	          results.push(currentString);
	        }
	        currentString = "";
	        results.push(piece);
	      }
	    }
	  });
	  if (!opt_results && currentString) {
	    results.push(currentString);
	  }
	  return [results, currentString];
	}

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
	      value: preRender(null, ast, "")[0],
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
	        console.log("prerendered", this.preRendered_);
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
	TEMPLATE_TYPE = "template";

	module.exports = {
	  type: type,
	  TEMPLATE_TYPE: TEMPLATE_TYPE,
	  buildTemplate: buildTemplate,
	};


/***/ },
/* 3 */
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
	    variable = __webpack_require__(4),
	    element = __webpack_require__(5),
	    attribute = __webpack_require__(6),
	    template = __webpack_require__(2);


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
	};



	module.exports = {
	  visitor: visitor,
	  createAst: createAst,
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Variable,
	    escapes,
	    type = __webpack_require__(2).type;

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
	    },
	    /**
	     * @param {Object=} opt_data
	     * return {string}
	     */
	    toString: {
	      value: function (opt_data) {
	        var data, result;
	        data = opt_data || {};
	        result = "";
	        if (data.hasOwnProperty(this.name)) {
	          result = data[this.name].toString(data);
	        }
	        return this.escape(result);
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
	    template = __webpack_require__(2);

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
	        var result;
	        if (this.type === template.TEMPLATE_TYPE) {
	          return this.preRenderChildren();
	        }
	        result = ["<", this.type];
	        this.attributes.forEach(function (attr) {
	          result.push(" ");
	          result.push(attr.name);
	          result.push("=\"");
	          result.push(attr.value);
	          result.push("\"");
	        });
	        if (this.selfClosing) {
	          result.push("/>");
	          return result;
	        }
	        result.push(">");
	        result = result.concat(this.preRenderChildren());
	        result.push("</");
	        result.push(this.type);
	        result.push(">");
	        return result;
	      },
	    },
	    /**
	     * @return {Array}
	     */
	    preRenderChildren: {
	      value: function () {
	        return this.children.map(function (child) {
	          if (child.hasOwnProperty("preRender")) {
	            return child.preRender();
	          } else {
	            return child.toString();
	          }
	        });
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
	var Attribute, 
	    type = __webpack_require__(2).type;

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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var uniqueId,
	    Variable = __webpack_require__(4).Variable,
	    meteorVariable = __webpack_require__(8),
	    djangletsTemplate = __webpack_require__(2);

	uniqueId = 0;

	/**
	 * @return {string}
	 */
	function getUniqueId() {
	  uniqueId += 1;
	  return "djlt." + uniqueId;
	}

	/**
	 * @param {MeteorTemplate}
	 * @param {Object.<string,*>} helpers
	 * @param {string|Element} idOrElement
	 * @return {LiveTemplate}
	 */
	function createLiveTemplate(template, helpers, idOrElement) {
	  console.log("createLiveTemplate", helpers);
	  var liveTemplate;
	  /**
	   * @constructor
	   */
	  liveTemplate = Object.create({
	    helpers_: {},
	  }, {
	    /**
	     * @type {Object.<string,MeteorVariable>}
	     */
	    variables: {
	      value: {},
	    },
	    /**
	     * @type {MeteorTemplate}
	     */
	    template: {
	      value: template,
	    },
	    /**
	     * @param {Object.<string,*>} helpers
	     */
	    helpers: {
	      set: function (helpers) {
	        var name, helper;
	        for (name in helpers) {
	          helper = helpers[name];
	          this.helpers_[name] = helper;
	        }
	        this.setupHelpers();
	      },
	      get: function () {
	        return this.helpers_;
	      },
	    },
	    /**
	     * Set up the reactivity on helpers.
	     */
	    setupHelpers: {
	      value: function () {
	        Object.keys(this.helpers).forEach(function(name) {
	          var helper, variable;
	          helper = this.helpers[name];
	          if (!this.variables.hasOwnProperty(name)) {
	            this.variables[name] = meteorVariable.createVariable(name);
	          }
	          variable = this.variables[name];
	          if (variable.tracker) {
	            variable.tracker.stop();
	          }
	          if (typeof helper === "function") {
	            variable.value = helper();
	            variable.tracker = Tracker.autorun(helper);
	          } else {
	            variable.value = helper;
	          }
	        }, this);
	      },
	    },
	    /**
	     * @param {string|Element} idOrElement
	     * @param {boolean=} first
	     */
	    render: {
	      value: function (idOrElement, first) {
	        var domState;
	        domState = {index: 0};
	        this.buildDomState(domState, template.template.ast, first);
	        console.log("first?", first);
	        if (first) {
	          this.renderInitial(idOrElement, domState);
	        }
	      },
	    },
	    /**
	     * @param {Object} domState
	     * @param {element} node
	     * @param {boolean} firstRun
	     */
	    buildDomState: {
	      value: function (domState, node, firstRun) {
	        var name;
	        if (typeof node === "string") {
	          domState.type = "string";
	          domState.value = node;
	          return;
	        }
	        if (Variable.isPrototypeOf(node)) {
	          name = node.name;
	          if (firstRun) {
	            if (!this.variables.hasOwnProperty(name)) {
	              this.variables[name] = meteorVariable.createVariable(name);
	            }
	            this.variables[name].variables.push(node);
	          }
	          domState.type = "string";
	          domState.value = this.variables[name].value;
	          return;
	        }
	        domState.type = node.type;
	        domState.attributes = [];
	        if (node.attributes && node.attributes.length) {
	          node.attributes.forEach(function(attribute) {
	            if (attribute.name === "id") {
	              domState.id = attribute.value;
	            } else {
	              domState.attributes.push({
	                name: attribute.name,
	                value: attribute.value,
	              });
	            }
	          });
	        }
	        if (!domState.id) {
	          domState.id = getUniqueId();
	        }
	        domState.children = [];
	        if (node.children && node.children.length) {
	          node.children.forEach(function (child, index) {
	            var childState = {parent: domState, index: index};
	            this.buildDomState(childState, child, firstRun);
	            domState.children.push(childState);
	          }, this);
	        }
	      },
	    },
	    renderInitial: {
	      value: function () {
	        console.log("renderInitial", arguments);
	      },
	    }
	  });
	  if (helpers) {
	    liveTemplate.helpers = helpers;
	  }
	  console.log("idOrElement?", idOrElement);
	  if (idOrElement) {
	    liveTemplate.render(idOrElement, true);
	  }
	  return liveTemplate;
	}

	/**
	 * @return {MeteorTemplate}
	 */
	function create(template) {
	  console.log("Meteor decorating.");
	  /**
	   * @constructor
	   */
	  return Object.create(template, {
	    /**
	     * @param {Object.<string,*> helpers
	     * @param {string|Element} idOrElement
	     * @return {LiveTemplate}
	     */
	    live: {
	      value: function (helpers, idOrElement) {
	        return createLiveTemplate(this, helpers, idOrElement);
	      },
	    },
	    template: {
	      value: template,
	    },
	  });
	}

	module.exports = {
	  create: create,
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

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
	  return Object.create({}, {
	    name: {
	      value: name,
	    },
	    tracker: {
	      value: null,
	      writable: true,
	      enumerable: true,
	    },
	    variables: {
	      value: [],
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
	  createVariable: createVariable
	};


/***/ }
/******/ ])