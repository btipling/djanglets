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
	    template = __webpack_require__(2);

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
	    template = __webpack_require__(7),
	    ast = __webpack_require__(8);

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

	var uniqueId, events,
	    Variable = __webpack_require__(6).Variable,
	    TEMPLATE_TYPE = __webpack_require__(7).TEMPLATE_TYPE,
	    emitter = __webpack_require__(3),
	    meteorVariable = __webpack_require__(4),
	    domStateCreator = __webpack_require__(5),
	    djangletsTemplate = __webpack_require__(7);

	uniqueId = 0;

	/**
	 * @enum {string}
	 */
	events = {
	  PRERENDER: "prerender",
	  RENDERED: "rendered",
	  CREATED: "created",
	  DESTROYED: "destroyed",
	};

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
	  liveTemplate = Object.create(emitter.createEmitter(), {
	    /**
	     * @type {Object}
	     * @private
	     */
	    helpers_: {
	      value: {},
	    },
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
	     * @type {DomState}
	     */
	    currentDomState: {
	      value: null,
	      writable: true,
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
	            variable.tracker = Tracker.autorun((function () {
	              var value = helper();
	              if (variable.value === value) {
	                return;
	              }
	              variable.value = value;
	              this.render();
	            }.bind(this)));
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
	        domState = domStateCreator.createDomState();
	        this.buildDomState(domState, template.template.ast, first);
	        console.log("first?", first);
	        if (first) {
	          this.renderInitial(idOrElement, domState);
	          return;
	        }
	        this.trigger(events.PRERENDER);
	        this.updateDomFromState(domState, this.currentDomState);
	        this.trigger(events.RENDERED);
	      },
	    },
	    /**
	     * @param {DomState} domState
	     * @param {DomState} currentDomState
	     */
	    updateDomFromState: {
	      value: function (domState, currentDomState) {
	        var updatedIndexes = [];
	        domState.children.forEach(function (child, index) {
	          var previousChild = currentDomState.children[index];
	          if (child.type !== "string") {
	            this.updateDomFromState(child, previousChild);
	            return;
	          }
	          if (child.value !== previousChild.value) {
	            updatedIndexes.push(index);
	          }
	        }, this);
	        if (updatedIndexes.length) {
	          updatedIndexes.forEach(function (index) {
	            var element, textNode, isTemplate;
	            isTemplate = domState.type === TEMPLATE_TYPE;
	            if (isTemplate && typeof this.idOrElement === "string") {
	              element = document.getElementById(this.idOrElement);
	            } else if (isTemplate) {
	              element = this.idOrElement;
	            } else {
	              element = document.getElementById(currentDomState.id);
	            }
	            if (!element) {
	              throw "Parent element not found! DOM was changed outside of template.";
	            }
	            textNode = element.childNodes[index];
	            if (!textNode) {
	              throw "Text node not found! DOM was changed outside of teplate.";
	            }
	            element.replaceChild(new Text(domState.children[index].value), textNode);
	            currentDomState.children[index] = domState.children[index];
	          });
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
	        domState.attributes.push({
	          name: "id",
	          value: domState.id,
	        });
	        if (node.children && node.children.length) {
	          node.children.forEach(function (child, index) {
	            var childState = domStateCreator.createDomState();
	            childState.parent = domState;
	            childState.index = index;
	            this.buildDomState(childState, child, firstRun);
	            domState.children.push(childState);
	          }, this);
	        }
	      },
	    },
	    renderInitial: {
	      value: function (idOrElement, domState) {
	        console.log("renderInitial");
	        var el;
	        if (Element.prototype.isPrototypeOf(idOrElement)) {
	          el = idOrElement;
	        } else {
	          el = document.getElementById(idOrElement);
	          if (!el) {
	            throw "Invalid render target. Must be an id or element.";
	          }
	        }
	        domState.preRender().forEach(function (child) {
	          el.appendChild(child);
	        });
	        this.currentDomState = domState;
	        this.trigger(events.CREATED);
	      },
	    }
	  });
	  if (helpers) {
	    liveTemplate.helpers = helpers;
	  }
	  console.log("idOrElement?", idOrElement);
	  if (idOrElement) {
	    //Allow time for adding event listeners.
	    setTimeout(function () {
	      liveTemplate.render(idOrElement, true);
	    }, 0);
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
	  events: events,
	  create: create,
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	function createEmitter() {
	  return Object.create({}, {
	    callbacks: {
	      value: {},
	      writable: true,
	    },
	    /**
	     * @param {string} type
	     * @param {Function} callback
	     * @return {number}
	     */
	    on: {
	      value: function (type, callback) {
	        if (!this.callbacks.hasOwnProperty(type)) {
	          this.callbacks[type] = [];
	        }
	        this.callbacks[type].push(callback);
	        return this.callbacks[type].length - 1;
	      },
	    },
	    /**
	     * @param {string=} opt_type
	     * @param {number=} opt_id
	     */
	    off: {
	      value: function (opt_type, opt_id) {
	        switch (arguments.length) {
	          case 0:
	            this.callbacks = {};
	            return;
	          case 1:
	            this.callbacks[opt_type] = [];
	            return;
	          case 2:
	            if (!this.callbacks.hasOwnProperty(opt_type)) {
	              return;
	            }
	            if (this.callbacks[opt_type][opt_id]) {
	              this.callbacks[opt_type][opt_id] = null;
	            }
	            return;
	        }
	      },
	    },
	    /**
	     * @param {string} type
	     */
	    trigger: {
	      value: function (type) {
	        if (!this.callbacks.hasOwnProperty(type)) {
	          return;
	        }
	        this.callbacks[type].forEach(function (callback) {
	          if (typeof callback === "function") {
	            callback();
	          }
	        });
	      },
	    },
	  });
	}

	module.exports = {
	  createEmitter: createEmitter,
	};


/***/ },
/* 4 */
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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var TEMPLATE_TYPE = __webpack_require__(7).TEMPLATE_TYPE;

	/**
	 * @return {DomState}
	 */
	function createDomState() {
	  /**
	   * @type {DomState}
	   * @constructor
	   */
	  return Object.create({}, {
	    id: {
	      value: "",
	      writable: true,
	      enumerable: true,
	    },
	    index: {
	      value: 0,
	      writable: true,
	      enumerable: true,
	    },
	    /**
	     * @type {*}
	     */
	    value: {
	      value: "",
	      writable: true,
	      enumberable: true,
	    },
	    /**
	     * @type {Array.<Object>}
	     */
	    attributes: {
	      value: [],
	      enumberable: true,
	    },
	    /**
	     * @type {Array.<DomState>}
	     */
	    children: {
	      value: [],
	      enumberable: true,
	    },
	    /**
	     * @type {string}
	     */
	    type: {
	      value: "",
	      writable: true,
	      enumerable: true,
	    },
	    /**
	     * @type {DomState}
	     */
	    parent: {
	      value: null,
	      writable: true,
	      enumerable: true,
	    },
	    preRender: {
	      value: function () {
	        var el;
	        if (this.type === TEMPLATE_TYPE) {
	          return this.children.map(function (child) {
	            return child.preRender();
	          });
	        } else if (this.type === "string") {
	          return new Text(this.value);
	        }
	        el = document.createElement(this.type);
	        this.attributes.forEach(function (attribute) {
	          el.setAttribute(attribute.name, attribute.value);
	        });
	        this.children.forEach(function (child) {
	          el.appendChild(child.preRender());
	        });
	        return el;
	      },
	    },
	  });
	}

	module.exports = {
	  createDomState: createDomState,
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Variable,
	    escapes,
	    type = __webpack_require__(7).type;

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
/* 7 */
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
	  ELIF: "ELIF",
	  ELSE: "ELSE",
	  ENDIF: "ENDIF",
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
	TEMPLATE_TYPE = "TEMPLATE";

	module.exports = {
	  type: type,
	  TEMPLATE_TYPE: TEMPLATE_TYPE,
	  buildTemplate: buildTemplate,
	};


/***/ },
/* 8 */
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
	    variable = __webpack_require__(6),
	    element = __webpack_require__(9),
	    ifTag = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./if\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())),
	    attribute = __webpack_require__(10),
	    template = __webpack_require__(7);

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


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Element,
	    template = __webpack_require__(7);

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
	    djangletType: {
	      value: template.type.ELEMENT,
	    },
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
	        var result, children;
	        result = [];
	        children = this.children;
	        function preRenderChildren() {
	          children.forEach(function (child) {
	            if (child.hasOwnProperty("preRender")) {
	              result = result.concat(child.preRender());
	            } else {
	              result.push(child.toString());
	            }
	          });
	        }
	        if (this.type === template.TEMPLATE_TYPE) {
	          preRenderChildren();
	          return result;
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
	        preRenderChildren();
	        result.push("</");
	        result.push(this.type);
	        result.push(">");
	        return result;
	      },
	    },
	  });
	}

	module.exports = {
	  Element: Element,
	  createElement: createElement,
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Attribute, 
	    type = __webpack_require__(7).type;

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