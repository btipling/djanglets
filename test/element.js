"use strict";

var djElement = require("../lib/djanglets/element"),
    djAttribute = require("../lib/djanglets/attribute"),
    template = require("../lib/djanglets/template"),
    djVariable = require("../lib/djanglets/variable"),
    element;

module.exports = {
  setUp: function (callback) {
    var i;
    element = djElement.createElement();
    element.type = "DIV";
    element.children.push(djElement.createElement());
    element.children[0].type = "P";
    element.children[0].children.push("This is a text node.");
    element.children.push("More");
    element.children.push(" ");
    element.children.push("text.");
    element.children.push(djElement.createElement());
    element.children[4].type = "span";
    element.children[4].children.push(djElement.createElement());
    element.children[4].children[0].type = "span";
    element.children[4].children[0].children.push("another text node");
    element.children[4].attributes.push(djAttribute.createAttribute());
    element.children[4].attributes[0].name = "class";
    element.children[4].attributes[0].value = "my-class-name";
    element.children.push(djElement.createElement());
    element.children[5].type = "HR";
    element.children[5].selfClosing = true;
    element.children.push(djVariable.createVariable("foo"));
    element.attributes.push(djAttribute.createAttribute());
    element.attributes[0].name = "style";
    element.attributes[0].value = "display:none;";
    element.attributes.push(djAttribute.createAttribute());
    element.attributes[1].name = "class";
    element.attributes[1].value = "foo-bar";
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testCreateMeteorVariable: function (test) {
    test.ok(djElement.Element.isPrototypeOf(element), "Should create a djanglets element.");
    test.equal(element.djangletType, template.type.ELEMENT, "Should be an element type.");
    test.done();
  },
  testElementHasChildren: function (test) {
    test.equal(element.children.length, 7, "Element should have the right number of children.");
    test.done();
  },
  testElementHasAttributes: function (test) {
    test.equal(element.attributes.length, 2, "Element should have the right number of attributes.");
    test.done();
  },
  testElementHasCorrectType: function (test) {
    test.equal(element.type, "DIV", "Element should have the right template type.");
    test.done();
  },
  testElementGeneratedAUniqueId: function (test) {
    var newElement;
    newElement = djElement.createElement();
    newElement.type = "DIV";
    test.ok(element.id, "Element should have the right id.");
    test.notEqual(element.id, newElement.id, "Element should have a unique id.");
    test.done();
  },
  testElementValueOf: function (test) {
    var expected = {
      type: template.type.ELEMENT,
      name: "DIV",
      id: element.id,
      children: [
        {
          type: template.type.ELEMENT,
          name: "P",
          id: element.children[0].id,
          children: [
            "This is a text node.",
          ],
        },
        "More",
        " ",
        "text.",
        {
          type: template.type.ELEMENT,
          name: "SPAN",
          id: element.children[4].id,
          children: [
            {
              type: template.type.ELEMENT,
              name: "SPAN",
              id: element.children[4].children[0].id,
              children: [
                "another text node",
              ]
            },
          ],
          attributes: [
            {name: "class", value: "my-class-name"},
          ],
        },
        {
          type: template.type.ELEMENT,
          name: "HR",
          id: element.children[5].id,
          selfClosing: true,
        },
        {
          type: template.type.VARIABLE,
          name: "foo",
        },
      ],
      attributes: [
        {name: "style", value: "display:none;"},
        {name: "class", value: "foo-bar"},
      ],
    };
    test.deepEqual(element.valueOf(), expected, "Should have created the correct valueOf.");
    test.done();
  },
  testToString: function (test) {
    var expected = [
      '<DIV style="display:none;" class="foo-bar"><P>This is a text node.</P>',
      'More text.<SPAN class="my-class-name"><SPAN>another text node</SPAN></SPAN><HR/>bar</DIV>'
    ].join("");
    test.equal(element.preRender()[0].toString({foo: "bar"}), expected,
      "Should have generated the correct HTML string");
    test.done();
  },
};


