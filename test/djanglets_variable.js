"use strict";

var djVariable = require("../lib/djanglets/variable"),
    template = require("../lib/djanglets/template");

module.exports = {
  setUp: function (callback) {
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testCreateMeteorVariable: function (test) {
    var variable, expected = "foo";
    variable = djVariable.createVariable("foo");
    test.ok(djVariable.Variable.isPrototypeOf(variable), "Should create a djanglets variable.");
    test.equals(variable.name, expected, "Variable should have gotten its name.");
    test.done();
  },
  testVariableValueOf: function (test) {
    var result, expected, variable;
    expected = {
      name: "foo",
      type: template.type.VARIABLE,
    };
    variable = djVariable.createVariable("foo");
    result = variable.valueOf();
    test.deepEqual(result, expected, "Should have produced the right valueOf result.");
    test.done();
  },
  testVariableToString: function (test) {
    var variable, result, expected = "bar", data = {foo: "bar"};
    variable = djVariable.createVariable("foo");
    result = variable.toString(data);
    test.equals(result, expected, "Should have the correct value from data.");
    test.done();
  },
  testEscapeVariable: function (test) {
    var variable, result, expected = "&lt;&gt;&quot;&#39;&amp;", data = {foo: "<>\"'&"};
    variable = djVariable.createVariable("foo");
    result = variable.toString(data);
    test.equals(result, expected, "Should have escaped the value from data.");
    test.done();
  },
}
