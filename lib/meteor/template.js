var uniqueId,
    Variable = require("../djanglets/variable").Variable,
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
     * @type {Object.<string,Array.<Object>}
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
      },
      get: function () {
        return this.helpers_;
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
        if (typeof node === "string") {
          domState.type = "string";
          domState.value = node;
          return;
        }
        if (Variable.isPrototypeOf(node)) {
          console.log("found variable", node);
          if (firstRun) {
            if (!this.variables.hasOwnProperty(name)) {
              this.variables[name] = [];
            }
            this.variables[name].push(node);
          }
          domState.type = "string";
          domState.value = "";
          console.log(this.helpers[node.name]);
          if (this.helpers.hasOwnProperty(node.name)) {
            if (typeof this.helpers[node.name] === "function") {
              domState.value = node.escape(this.helpers[node.name]());
              console.log("func");
            } else {
              console.log("val");
              domState.value = node.escape(this.helpers[node.name]);
            }
          }
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
