"use strict";

var uniqueId,
    Variable = require("../djanglets/variable").Variable,
    meteorVariable = require("./variable"),
    domStateCreator = require("./dom_state"),
    djangletsTemplate = require("../djanglets/template");

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
     * @type {DomState}
     */
    previousDomState: {
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
        domState = domStateCreator.createDomState();
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
