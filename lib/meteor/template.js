"use strict";

var events,
    utils = require("../djanglets/utils"),
    Variable = require("../djanglets/variable").Variable,
    djangletsTemplate = require("../djanglets/template"),
    djangletsIf = require("../djanglets/if"),
    djangletsFor = require("../djanglets/for"),
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
     * @param {HTMLElement}
     */
    firstChild: {
      value: null,
      writable: true,
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
              // XXX: This equality check has obvious problems with Objects and Array.
              // Should this be a deep equals?
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
     * Render or update the DOM
     */
    render: {
      value: function () {
        var domState;
        domState = domStateCreator.createDomState();
        this.buildDomState(domState, template.template.ast);
        if (!this.currentDomState) {
          this.renderInitial(domState);
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

        var currentIndex = 0, domIndex = 0, i, child, currentChild, parent,
          domStateChildren,
          // domIndex may not be 0 at template level, there number of children in the
          // dom before the template is beyond control, this number needs to be discovered,
          // by keeping track of the first dom element.
          childNodes = this.getParent(currentDomState).childNodes,
          foundFirstChild = false,
          isFirstChild;


        if (domState.type === djangletsTemplate.TEMPLATE_TYPE) {
          isFirstChild = true;
          for (; domIndex < childNodes.length; domIndex++) {
            if (childNodes[domIndex] === this.firstChild) {
              foundFirstChild = true;
              break;
            }
          }
          if (!foundFirstChild) {
            throw new Error([
              "Could not find first element in template. DOM was manipulated",
              "outside of live template.",
            ].join(" "));
          }
        }

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
        if (!domState.children) {
          throw new Error("Live djanglets template cannot be empty.");
        }
        for (i = 0; i < domState.children.length; i++) {
          child = domState.children[i];
          if (currentIndex >= currentDomState.children.length) {
            this.insertAtEnd(currentDomState, child, domIndex, isFirstChild);
            isFirstChild = false;
            domIndex++;
            continue;
          }
          currentChild = currentDomState.children[currentIndex];
          var parent = this.getParent(currentDomState);
          var currentChildEl = parent.childNodes[domIndex];
          if (child.parent.type === djangletsTemplate.TEMPLATE_TYPE) {
            //debugger;
          }
          if (this.childrenAreTheSame(child, currentChild)) {
            currentIndex++;
          } else {
            if (this.domStateHasChild(domStateChildren, currentChild)) {
              this.insertBefore(currentDomState, domIndex, child, isFirstChild);
            } else {
              this.replaceChild(currentDomState, domIndex, child, isFirstChild);
              currentIndex++;
            }
          }
          domIndex++;
          isFirstChild = false;
          domStateChildren.shift();
        }
        this.removeRest(currentDomState, domIndex);
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
          throw new Error("Parent element not found! DOM was changed outside of template.");
        }
        return element;
      },
    },
    removeChild: {
      value: function (domState, index) {
        var el, parent;
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
    removeRest: {
      value: function (domState, index) {
        var parent;
        parent = this.getParent(domState);
        while(parent.childNodes.length > index + 1) {
          parent.removeChild(parent.childNodes[index]);
        }
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
     * @param {Array.<DomState|string} children
     * @param {DomState} child
     */
    domStateHasChild: {
      value: function (children, child) {
        var i;
        for (i = 0; i < children.length; i++) {
          if (this.childrenAreTheSame(children[i], child)) {
            return true;
          }
        }
        return false;
      },
    },
    /**
     * In the case of the root parent element, this does not insert at the very end
     * of the parent element. There may be non-template elements after this template's
     * elements. We insert after our last temmplate element and before those elements
     * that do not belong to this template and may or may not be there.
     * @param {number} domIndex
     * @param {DomState} child
     * @param {DomState} domState
     * @param {boolean} isFirstChild
     */
    insertAtEnd: {
      value: function (domState, child, domIndex, isFirstChild) {
        var newEl, parent, nextNode;
        parent = this.getParent(domState);
        newEl = this.createNodeFromChild(child);
        if (isFirstChild) {
          this.firstChild = newEl;
        }
        if (parent.childNodes.length === domIndex) {
          parent.appendChild(newEl);
          return;
        }
        parent.insertBefore(newEl, parent.childNodes[domIndex+1]);
      },
    },
    /**
     * @param {DomState} domState
     * @param {number} index
     * @param {DomState} child
     * @param {boolean} isFirstChild
     */
    insertBefore: {
      value: function (domState, index, child, isFirstChild) {
        var parent, newEl, el;
        parent = this.getParent(domState);
        el = parent.childNodes[index];
        if (!el) {
          throw new Error([
            "Could not insert before non-existing element! DOM manipulated",
            "outside of live template!"
          ].join(" "));
        }
        newEl = this.createNodeFromChild(child);
        if (isFirstChild) {
          this.firstChild = newEl;
        }
        parent.insertBefore(newEl, el);
      },
    },
    /**
     * @param {DomState} domState
     * @param {number} index
     * @param {DomState} child
     * @param {boolean} isFirstChild
     */
    replaceChild: {
      value: function (domState, index, child, isFirstChild) {
        var parent, el, newEl;
        parent = this.getParent(domState);
        el = parent.childNodes[index];
        if (!el) {
          throw new Error([
            "Could replaceChild with non-existing element! DOM manipulated",
            "outside of live template!"
          ].join(" "));
        }
        newEl = this.createNodeFromChild(child);
        if (isFirstChild) {
          this.firstChild = newEl;
        }
        parent.replaceChild(newEl, el);
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
     * @param {Object=} opt_contextData
     * @return {*}
     */
    getVariable: {
      value: function (name, def, opt_contextData) {
        var result;
        result = utils.getVariable(name, opt_contextData || {});
        if (!Error.prototype.isPrototypeOf(result)) {
          return result;
        }
        if (this.variables.hasOwnProperty(name)) {
          return this.variables[name].value;
        }
        return result;
      },
    },
    /**
     * @param {Object} domState
     * @param {element} node
     */
    buildStringState: {
      value: function (domState, node) {
        var sibling;
        if (node === " ") {
          if (domState.parent && domState.parent.children.length) {
            sibling = domState.parent.children[domState.parent.children.length - 1];
            if (sibling.value === " ") {
              //Do not add another unnecessary blank.
              return;
            }
          }
        }
        domState.type = djangletsTemplate.type.STRING;
        domState.value = node;
        domState.parent.children.push(domState);
      },
    },
    /**
     * @param {Object} domState
     * @param {element} node
     * @param {Object=} opt_contextData
     */
    buildVariableState: {
      value: function (domState, node, opt_contextData) {
        domState.type = djangletsTemplate.type.STRING;
        domState.value = this.getVariable(node.name, "", opt_contextData);
        domState.parent.children.push(domState);
      },
    },
    /**
     * @param {Object} domState
     * @param {element} node
     * @param {Object=} opt_contextData
     * @param {string|number=} opt_id
     */
    buildIfState: {
      value: function (domState, node, opt_contextData, opt_id) {
        var condition, child, i;
        condition = null;
        for (i = 0; !condition && i < node.children.length; i++) {
          child = node.children[i];
          if (child.type === djangletsTemplate.type.ELIF) {
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
            childState.parent = domState.parent;
            childState.index = index;
            this.buildDomState(childState, child, opt_contextData, opt_id);
          }, this);
        }
      },
    },
    /**
     * @param {Object} domState
     * @param {element} node
     * @param {Object=} opt_contextData
     * @param {string|number=} opt_id
     */
    buildForState: {
      value: function (domState, node, opt_contextData, opt_id) {
        var loopData, keys, idCount = 0, data;
        data = opt_contextData || {};
        loopData = this.getVariable(node.variable, null);
        if (!loopData) {
          return;
        }
        switch(Object.prototype.toString.call(loopData)) {
          case "[object Array]":
            loopData.map(function (value, index) {
              var childData, key;
              key = "" + index;
              childData = {context: data};
              childData[node.key] = key;
              childData[node.value] = value;
              node.children.forEach(function (child, index) {
                var childState = domStateCreator.createDomState();
                childState.parent = domState.parent;
                childState.index = index;
                this.buildDomState(
                  childState,
                  child,
                  childData,
                  "" + (opt_id || "") + "." + idCount
                );
              }, this);
              idCount++;
            }, this).join("");
            return;
          case "[object Object]":
            keys = Object.keys(loopData);
            keys.forEach(function (key, index) {
              var childData = {context: data};
              childData[node.key] = key;
              childData[node.value] = loopData[key];
              node.children.forEach(function (child) {
                var childState = domStateCreator.createDomState();
                childState.parent = domState.parent;
                childState.index = index;
                this.buildDomState(
                  childState,
                  child,
                  childData,
                  "" + (opt_id || "") + "." + idCount
                );
              }, this);
              idCount++;
            }, this);
            return;
        }
      },
    },
    /**
     * @param {Object} domState
     * @param {element} node
     * @param {Object=} opt_contextData
     * @param {string|number=} opt_id
     */
    buildElementState: {
      value: function (domState, node, opt_contextData, opt_id) {
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
          domState.id = node.id + "." + this.id + (opt_id || "");
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
            this.buildDomState(childState, child, opt_contextData, opt_id);
          }, this);
        }
        if (domState.parent) {
          domState.parent.children.push(domState);
        }
      },
    },
    /**
     * @param {Object} domState
     * @param {element} node
     * @param {Object=} opt_contextData
     * @param {string|number=} opt_id
     */
    buildDomState: {
      value: function (domState, node, opt_contextData, opt_id) {
        if (typeof node === "string") {
          this.buildStringState(domState, node);
        } else if (Variable.isPrototypeOf(node)) {
          this.buildVariableState(domState, node, opt_contextData);
        } else if (djangletsIf.If.isPrototypeOf(node)) {
          this.buildIfState(domState, node, opt_contextData, opt_id);
        } else if (djangletsFor.For.isPrototypeOf(node)) {
          this.buildForState(domState, node, opt_contextData, opt_id);
        } else {
          this.buildElementState(domState, node, opt_contextData, opt_id);
        }
      },
    },
    renderInitial: {
      value: function (domState) {
        var el, children;
        if (Element.prototype.isPrototypeOf(this.idOrElement)) {
          el = this.idOrElement;
        } else {
          el = document.getElementById(this.idOrElement);
          if (!el) {
            throw new Error("Invalid render target. Must be an id or element.");
          }
        }
        children = domState.preRender();
        if (!children.length) {
          throw new Error("Live djanglets template cannot be empty.");
        }
        children.forEach(function (child) {
          if (!this.firstChild) {
            this.firstChild = child;
          }
          el.appendChild(child);
        }, this);
        this.currentDomState = domState;
        this.trigger(events.CREATED);
      },
    }
  });
  //Allow time for adding event listeners.
  setTimeout(function () {
    if (helpers) {
      liveTemplate.helpers = helpers;
    } else {
      liveTemplate.render();
    }
  }, 0);
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
