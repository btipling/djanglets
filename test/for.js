"use strict";

var djFor = require("../lib/djanglets/for"),
    djElement = require("../lib/djanglets/element"),
    djVariable = require("../lib/djanglets/variable"),
    template = require("../lib/djanglets/template"),
    forObj;

module.exports = {
  setUp: function (callback) {
    forObj = djFor.createFor("fooKey", "fooValue", "fooVariable");
    forObj = djFor.createFor("fooKey", "fooValue", "fooVariable");
    forObj.children.push(djElement.createElement());
    forObj.children[0].type = "SPAN";
    forObj.children[0].children.push(djVariable.createVariable("fooKey"));
    forObj.children[0].children.push(":");
    forObj.children[0].children.push(djVariable.createVariable("fooValue"));
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testCreateFor: function (test) {
    var expected;
    test.ok(djFor.For.isPrototypeOf(forObj), "Should create a djanglets forObj.");
    expected = "fooKey";
    test.equal(forObj.key, expected, "Should have the right key name.");
    expected = "fooValue";
    test.equal(forObj.value, expected, "Should have the right value name.");
    expected = "fooVariable";
    test.equal(forObj.variable, expected, "Should have the right variable name.");
    test.equal(forObj.children.length, 1, "Should have had the right number of children.");
    test.done();
  },
  testForArrayLogic: function (test) {
    var expected, data = {fooVariable: [
      "cat",
      "dog",
      "cow",
    ]};
    expected = "<SPAN>0:cat</SPAN><SPAN>1:dog</SPAN><SPAN>2:cow</SPAN>";
    test.equal(forObj.preRender()[0].toString(data), expected,
      "Should have executed for logic correctly.");
    test.done();
  },
  testForObjectLogic: function (test) {
    var expected, data = {fooVariable: {
      cat: "meow",
      dog: "woof",
      cow: "moo",
    }};
    expected = "<SPAN>cat:meow</SPAN><SPAN>dog:woof</SPAN><SPAN>cow:moo</SPAN>";
    test.equal(forObj.preRender()[0].toString(data), expected,
      "Should have executed for logic correctly.");
    test.done();
  },
};


