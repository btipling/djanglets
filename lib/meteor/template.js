"use strict";

var events,
    utils = require("../djanglets/utils"),
    Variable = require("../djanglets/variable").Variable,
    djangletsTemplate = require("../djanglets/template"),
    djangletsIf = require("../djanglets/if"),
    emitter = require("./emitter"),
    meteorVariable = require("./variable"),
    domStateCreator = require("./dom_state"),
    djangletsTemplate = require("../djanglets/template");

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
     * @type {string}
     */
    id: {
      value: utils.getUniqueId(),
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

        // see which children that are elements exist in both states
        // iterate over currentDomState children
          // if current Child is a string continue
          // iterate over domState children
            // if domState child is a string continue
            // if domState child is equal to current child
              // call updateDomFromState recursively
              // break out of domState children iteration

        var currentIndex = 0, i, child, currentChild, parent;

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
              this.updateDomFromState(child, current);
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


        for (i = 0; i < domState.children.length; i++) {
          child = domState.children[i];
          if (currentIndex >= currentDomState.children.length) {
            this.insertAtEnd(currentDomState, child);
            continue;
          }
          currentChild = currentDomState.children[currentIndex];
          currentIndex++;
          if (this.childrenAreTheSame(child, currentChild)) {
            if (this.domStateHasChild(domState, currentChild)) {
              this.insertBefore(currentDomState, currentIndex, child);
            } else {
              this.replaceChild(currentDomState, currentIndex, child);
            }
          }
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
    /**
     * @param {DomState} childA
     * @param {DomState} childB
     * @return {boolean}
     */
    childrenAreTheSame: {
      value: function (childA, childB) {
        if (childA.type !== childB.type) {
          return false;
        }
        if (childA.type === djangletsTemplate.type.STRING) {
          return childA.value === childB.value;
        }
        return childA.id === childB.id;
      },
    },
    /**
     * @param {DomState} domState
     * @param {DomState} child
     */
    domStateHasChild: {
      value: function (domState, child) {
        var i;
        for (i = 0; i < domState.children.length; i++) {
          if (this.childrenAreTheSame(domState.children[i], child)) {
            return true;
          }
        }
        return false;
      },
    },
    /**
     * @param {DomState} domState
     * @param {DomState} child
     */
    insertAtEnd: {
      value: function (domState, child) {
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
        parent = this.getParent(currentDomState);
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
        var parent, el;
        parent = this.getParent(currentDomState);
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
        if (this.variables.hasOwnProperty(name)) {
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
