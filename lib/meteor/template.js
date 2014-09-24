"use strict";

var uniqueId, events,
    Variable = require("../djanglets/variable").Variable,
    TEMPLATE_TYPE = require("../djanglets/template").TEMPLATE_TYPE,
    emitter = require("./emitter"),
    meteorVariable = require("./variable"),
    domStateCreator = require("./dom_state"),
    djangletsTemplate = require("../djanglets/template");

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
            element.replaceChild(textNode, new Text(domState.children[index]));
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
          domState.type = node.type;
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
        el.innerHTML = domState.preRender().join("");
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
