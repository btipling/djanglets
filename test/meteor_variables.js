"use strict";

var meteorVariable = require("../lib/meteor/variable");

module.exports = {
  setUp: function (callback) {
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testCreateMeteorVariable: function (test) {
    var variable, expected = "foo";
    variable = meteorVariable.createVariable("foo");
    test.ok(meteorVariable.Variable.isPrototypeOf(variable), "Should have created a variable.");
    test.equals(variable.name, expected, "Variable shoul have gotten its name.");
    test.done();
  },
  testSetVariableValue: function (test) {
    var variable, expected = "foo";
    variable = meteorVariable.createVariable("foobar");
    variable.value = "foo";
    test.equals(variable.value, expected, "Should have been able to set a value on variable.");
    test.done();
  },
}
