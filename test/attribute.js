"use strict";

var djAttribute = require("../lib/djanglets/attribute"),
    template = require("../lib/djanglets/template");

module.exports = {
  setUp: function (callback) {
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testCreateMeteorVariable: function (test) {
    var attribute, expected = "foo";
    attribute = djAttribute.createAttribute("foo");
    test.ok(djAttribute.Attribute.isPrototypeOf(attribute), "Should create a djanglets attribute.");
    test.done();
  },
  testAttributeValueOf: function (test) {
    var attribute, expected = {name: "foo", value: "bar"}, result;
    attribute = djAttribute.createAttribute();
    attribute.name = "foo";
    attribute.value = "bar";
    result = attribute.valueOf();
    test.deepEqual(result, expected, "Should have done a proper valueOf for attribute.");
    test.done();
  },
};

