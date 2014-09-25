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
	    template = __webpack_require__(6),
	    ast = __webpack_require__(7);

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

	var events,
	    utils = __webpack_require__(12),
	    Variable = __webpack_require__(8).Variable,
	    djangletsTemplate = __webpack_require__(6),
	    djangletsIf = __webpack_require__(10),
	    emitter = __webpack_require__(3),
	    meteorVariable = __webpack_require__(4),
	    domStateCreator = __webpack_require__(5),
	    djangletsTemplate = __webpack_require__(6);

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
	     * The id of this live template.
	     * @type {string}
	     */
	    id: {
	      value: utils.getUniqueId(),
	    },
	    /**
	     * The element or id of the element that serves as this templates
	     * attach point to the browser's document.
	     * @type {string}
	     */
	    idOrElement: {
	      value: idOrElement,
	      enumerable: true,
	    },
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
	        this.buildDomState(domState, template.template.ast);
	        if (first) {
	          this.renderInitial(idOrElement, domState);
	          return;
	        }
	        this.trigger(events.PRERENDER);
	        this.updateDomFromState(domState, this.currentDomState);
	        this.currentDomState = domState;
	        this.trigger(events.RENDERED);
	      },
	    },
	    /**
	     * @param {DomState} domState
	     * @param {DomState} currentDomState
	     */
	    updateDomFromState: {
	      value: function (domState, currentDomState) {

	        // see which children that are elements exist in both states
	        // iterate over currentDomState children
	          // if current Child is a string continue
	          // iterate over domState children
	            // if domState child is a string continue
	            // if domState child is equal to current child
	              // call updateDomFromState recursively
	              // break out of domState children iteration

	        var currentIndex = 0, i, child, currentChild, parent, domStateChildren;

	        currentDomState.children.forEach(function (currentChild) {
	          var i, child;
	          if (currentChild.type === djangletsTemplate.type.STRING) {
	            return;
	          }
	          for (i = 0; i < domState.children.length; i++) {
	            child = domState.children[i];
	            if (child.type === djangletsTemplate.type.STRING) {
	              continue;
	            }
	            if (this.childrenAreTheSame(currentChild, child)) {
	              this.updateDomFromState(child, currentChild);
	              break;
	            }
	          }
	        }, this);

	        //get a list of the next children (have that in domState.children)
	        //set current childNodes index to 0
	        //iterate through next children
	          // grab next child
	          // get childNodes at index
	          // if has childNodes at index
	            // see if child equals current childNodes at index
	              // if so
	                // increment index to 1 and continue to next child
	              // if not
	                // see if childNode at index is next children
	                  // if so
	                    // insert child before childNode at index
	                    // increment index and continue to next child
	                  // if not
	                    // replace childNode at index with child
	         //if no childNodes at index
	           // insert child at end


	        //inserting child:
	          //if string
	            // new Text(value)
	          //if element
	            //prerender child


	        domStateChildren = [].concat(domState.children);
	        for (i = 0; i < domState.children.length; i++) {
	          child = domState.children[i];
	          if (currentIndex >= currentDomState.children.length) {
	            this.insertAtEnd(currentDomState, child);
	            continue;
	          }
	          currentChild = currentDomState.children[currentIndex];
	          console.log("checking", domState.id);
	          if (!this.childrenAreTheSame(child, currentChild)) {
	            if (this.domStateHasChild(domStateChildren, currentChild)) {
	              this.insertBefore(currentDomState, currentIndex, child);
	            } else {
	              this.replaceChild(currentDomState, currentIndex, child);
	            }
	          }
	          domStateChildren.shift();
	          currentIndex++;
	        }
	        for (; currentIndex < currentDomState.children.length; currentIndex++) {
	          this.removeChild(currentDomState, index);
	        }
	      },
	    },
	    /**
	     * @param {DomState}
	     * @return {HTMLElement}
	     */
	    getParent: {
	      value: function (domState) {
	        var element, isTemplate;
	        isTemplate = domState.type === djangletsTemplate.TEMPLATE_TYPE;
	        if (isTemplate && typeof this.idOrElement === "string") {
	          element = document.getElementById(this.idOrElement);
	        } else if (isTemplate) {
	          element = this.idOrElement;
	        } else {
	          element = document.getElementById(domState.id);
	        }
	        if (!element) {
	          throw "Parent element not found! DOM was changed outside of template.";
	        }
	        return element;
	      },
	    },
	    removeChild: {
	      value: function (domState, index) {
	        var el, parent
	        parent = this.getParent(domState);
	        el = parent.childNodes[index];
	        if (!el) {
	          throw new Error([
	            "Could not remove non-existing element! DOM manipulated",
	            "outside of live template!"
	          ].join(" "));
	        }
	        parent.removeChild(el);
	      },
	    },
	    /**
	     * @param {DomState} childA
	     * @param {DomState} childB
	     * @return {boolean}
	     */
	    childrenAreTheSame: {
	      value: function (childA, childB) {
	        if (childA.type !== childB.type) {
	          console.log("    childrenAreTheSame: not the same type", childA, childB);
	          return false;
	        }
	        if (childA.type === djangletsTemplate.type.STRING) {
	          console.log("    childrenAreTheSame: same string?",  childA.value === childB.value, childA, childB);
	          return childA.value === childB.value;
	        }
	        console.log("    childrenAreTheSame: same element?",  childA.id === childB.id, childA, childB);
	        return childA.id === childB.id;
	      },
	    },
	    /**
	     * @param {Array.<DomState|string} children
	     * @param {DomState} child
	     */
	    domStateHasChild: {
	      value: function (children, child) {
	        var i;
	        for (i = 0; i < children.length; i++) {
	          if (this.childrenAreTheSame(children[i], child)) {
	            console.log("   domStateHasChild", true, child);
	            return true;
	          }
	        }
	        console.log("    domStateHasChild", false, child);
	        return false;
	      },
	    },
	    /**
	     * @param {DomState} domState
	     * @param {DomState} child
	     */
	    insertAtEnd: {
	      value: function (domState, child) {
	        console.warn("insertingAtEnd", domState, child);
	        this.getParent(domState).appendChild(this.createNodeFromChild(child));
	      },
	    },
	    /**
	     * @param {DomState} domState
	     * @param {number} index
	     * @param {DomState} child
	     */
	    insertBefore: {
	      value: function (domState, index, child) {
	        var parent, el;
	        console.warn("inserting before", domState, index, child);
	        parent = this.getParent(domState);
	        el = parent.childNodes[index];
	        if (!el) {
	          throw new Error([
	            "Could not insert before non-existing element! DOM manipulated",
	            "outside of live template!"
	          ].join(" "));
	        }
	        parent.insertBefore(this.createNodeFromChild(child), el);
	      },
	    },
	    /**
	     * @param {DomState} domState
	     * @param {number} index
	     * @param {DomState} child
	     */
	    replaceChild: {
	      value: function (domState, index, child) {
	        console.warn("replacing child", domState, index, child);
	        var parent, el;
	        parent = this.getParent(domState);
	        el = parent.childNodes[index];
	        if (!el) {
	          throw new Error([
	            "Could replaceChild with non-existing element! DOM manipulated",
	            "outside of live template!"
	          ].join(" "));
	        }
	        parent.replaceChild(this.createNodeFromChild(child), el);
	      },
	    },
	    /**
	     * @param {DomState} child
	     * @return {HTMLNode}
	     */
	    createNodeFromChild: {
	      value: function (child) {
	        if (child.type === djangletsTemplate.type.STRING) {
	          return new Text(child.value);
	        }
	        return child.preRender();
	      },
	    },
	    /**
	     * @param {string} name
	     * @param {*} def The default
	     * @return {*}
	     */
	    getVariable: {
	      value: function (name, def) {
	        console.log("getVariable", name, this.variables.hasOwnProperty(name) ? "has" : "has not");
	        if (this.variables.hasOwnProperty(name)) {
	          console.log("getVariable value", name, "===", this.variables[name].value);
	          return this.variables[name].value;
	        }
	        return def;
	      },
	    },
	    /**
	     * @param {Object} domState
	     * @param {element} node
	     */
	    buildDomState: {
	      value: function (domState, node) {
	        var variable, i, child, condition;
	        if (typeof node === "string") {
	          domState.type = djangletsTemplate.type.STRING;
	          domState.value = node;
	          domState.parent.children.push(domState);
	          return;
	        }
	        if (Variable.isPrototypeOf(node)) {
	          domState.type = djangletsTemplate.type.STRING;
	          domState.value = this.getVariable(node.name, "");
	          domState.parent.children.push(domState);
	          return;
	        }
	        if (djangletsIf.If.isPrototypeOf(node)) {
	          condition = null;
	          for (i = 0; !condition && i < node.children.length; i++) {
	            child = node.children[i];
	            if (child.type === djangletsTemplate.type.ELIF) {
	              console.log("checking ELIF", child.variable, this.getVariable(child.variable, false));
	              if (this.getVariable(child.variable, false)) {
	                condition = child;
	              }
	              continue;
	            }
	            condition = child;
	          }
	          if (condition) {
	            condition.children.forEach(function (child, index) {
	              var childState = domStateCreator.createDomState();
	              childState.parent = domState;
	              childState.index = index;
	              this.buildDomState(childState, child);
	              domState.parent.children.push(childState);
	            }, this);
	          }
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
	          domState.id = node.id + "." + this.id;
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
	            this.buildDomState(childState, child);
	          }, this);
	        }
	        if (domState.parent) {
	          domState.parent.children.push(domState);
	        }
	      },
	    },
	    renderInitial: {
	      value: function (idOrElement, domState) {
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

	var template = __webpack_require__(6);

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
	        switch (this.type) {
	          case template.TEMPLATE_TYPE:
	            //Just return the children of the template, not the template itself.
	            return this.children.map(function (child) {
	              return child.preRender();
	            });
	          case template.type.STRING:
	            return new Text(this.value);
	          default:
	            el = document.createElement(this.type);
	            this.attributes.forEach(function (attribute) {
	              el.setAttribute(attribute.name, attribute.value);
	            });
	            this.children.forEach(function (child) {
	              el.appendChild(child.preRender());
	            });
	          return el;
	        }
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
	var type, TEMPLATE_TYPE,
	    utils = __webpack_require__(12);

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
/* 7 */
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
	    variable = __webpack_require__(8),
	    element = __webpack_require__(9),
	    ifTag = __webpack_require__(10),
	    attribute = __webpack_require__(11),
	    template = __webpack_require__(6);

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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Variable,
	    escapes,
	    type = __webpack_require__(6).type;

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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Element,
	    utils = __webpack_require__(12),
	    template = __webpack_require__(6);

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

	var If, Elif, Else,
	    utils = __webpack_require__(12),
	    type = __webpack_require__(6).type;

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
	                if (opt_data[variable]) {
	                  return this.elifs[variable].toString(opt_data);
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Attribute, 
	    type = __webpack_require__(6).type;

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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var uniqueId;

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
	      if (Object.prototype.toString.call(piece) === '[object Array]') {
	        /*
	         * We want to build strings until we hit an object like a variable or an if, so we
	         * modify `results`, while also returning currentString because we may be building
	         * up this string some more inside the next recursive call to flattenPreRender.
	         *
	         * XXX: This recursion could blow up if the stack got too big, it would have to be
	         * pretty big I think.
	         */
	        currentString = flattenPreRender(results, piece, currentString);
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

	function flattenPreRender (results, pieces) {
	  var finalString = flattenPreRender_(results, pieces, "");
	  if (finalString) {
	    results.push(finalString);
	  }
	}

	module.exports = {
	  flattenPreRender: flattenPreRender,
	  getUniqueId: getUniqueId,
	};


/***/ }
/******/ ])