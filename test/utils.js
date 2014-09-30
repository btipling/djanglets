"use strict";

var utils = require("../lib/djanglets/utils");

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
};
