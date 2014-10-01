"use strict";

var utils = require("../lib/djanglets/utils"),
    meteorVariable = require("../lib/meteor/variable");

module.exports = {
  setUp: function (callback) {
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testFlattenPrerender: function (test) {
    var pieces, expectedStr1, expectedStr2, expectedStr3, expectedLength, results = [];
    expectedStr1 = "The quick red fox jumped over the lazy brown dog.";
    expectedStr2 = " foo  foo";
    expectedStr3 = " foobar";
    expectedLength = 5;

    pieces = [
      "The quick",
      [
        " ",
        "red ",
        [
          "fox jumped over", " ",
        ],
        "the lazy brown",
      ],
      " dog.",
      {},
      " foo ",
      [ " ", "foo", {}, " foo",],
      "bar",
    ];
    utils.flattenPreRender(results, pieces);
    test.equals(results.length, expectedLength, "Expected array to have been flattened.");
    test.equals(results[0], expectedStr1, "Expected strings to be concatonated.");
    test.equals(results[2], expectedStr2, "Expected subsequent strings to be concatonated");
    test.equals(results[4], expectedStr3, "Expected last string to be concatonated.");
    test.done();
  },
  testBasicVariableLookup: function (test) {
    var result, expected = "bar", data = {foo: "bar"};
    result = utils.getVariable("foo", data);
    test.equals(result, expected, "Expected to get a variable from an object.");
    test.done();
  },
  testNestedVariableLookup: function (test) {
    var result, expected = "bar", data = {foo: {bar: "bar"}};
    result = utils.getVariable("foo.bar", data);
    test.equals(result, expected, "Expected to get nested variable lookup to work.");
    test.done();
  },
  testContextLookup: function (test) {
    var result, expected = "bar", data = {a: "b", __context__: {foo: "bar"}};
    result = utils.getVariable("foo", data);
    test.equals(result, expected, "Expected to have contexts checked.");
    test.done();
  },
  testArrayLookup: function (test) {
    var result, expected1 = "bar", expected2 = "foo", data = [{foo: "bar"}, {bar: "foo"}];
    result = utils.getVariable("foo", data);
    test.equals(result, expected1, "Expected foo variable look up with multiple datas.");
    result = utils.getVariable("bar", data);
    test.equals(result, expected2, "Expected bar variable look up with multiple datas.");
    test.done();
  },
  testNestedContextArrayLookup: function (test) {
    var result, expected, data;
    data = [
      {
        a: "b",
        c: "d",
        __context__: {
          aa: "bb",
          cc: "dd",
          __context__: {
            foo: "bar",
            foobar: "foobar",
          }
        }
      },
      {
        dog: "woof",
        cat: "nope",
        __context__: {
          test: "testing",
          foo: "notbar",
          cat: "meow",
        },
      },
    ];
    expected = "bar";
    result = utils.getVariable("foo", data);
    test.equals(result, expected, "Expected first item in array to be examined first");
    expected = "testing";
    result = utils.getVariable("__context__.test", data);
    test.equals(result, expected, "Expected second data in array to find lookup.");
    expected = "meow";
    result = utils.getVariable("__context__.cat", data);
    test.equals(result, expected, "Expected first cat to be ignored.");
    test.done();
  },
  testLiveVariableObjectLookup: function (test) {
    var variable, result, expected, data;
    variable = meteorVariable.createVariable("foo");
    variable.value = "bar";
    expected = "bar";
    data = {a: "b", foo: variable};
    result = utils.getVariable("foo", data);
    test.equals(result, expected, "Expected a live variable lookup to work.");
    test.done();
  },
  testLiveVariableLookupInArray: function (test) {
    var variable, result, expected, data;
    variable = meteorVariable.createVariable("foo");
    variable.value = "bar";
    expected = "bar";
    data = [{a: "b"}, {foo: variable}];
    result = utils.getVariable("foo", data);
    test.equals(result, expected, "Expected a live variable lookup to work.");
    test.done();
  },
  testGetUniqueId: function (test) {
    var result1, result2;
    result1 = utils.getUniqueId();
    result2 = utils.getUniqueId();
    test.notEqual(result1.toString(), result2.toString(), "Expected ids to be unique.");
    test.done();
  },
};
