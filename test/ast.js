"use strict";

var ast,
   djAst = require("../lib/djanglets/ast");

module.exports = {
  setUp: function (callback) {
    ast = djAst.createAst();
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testAstCreated: function (test) {
    test.ok(djAst.ast.isPrototypeOf(ast), "Should have created an ast.");
    test.done();
  },
  testAstAddNode: function (test) {
    test.ok(false);
    test.done();
  },
  testAstGetCurrentNode: function (test) {
    test.ok(false);
    test.done();
  },
  testPopNodeStack: function (test) {
    test.ok(false);
    test.done();
  },
  testValueOf: function (test) {
    test.ok(false);
    test.done();
  },
  testState: function (test) {
    test.ok(false);
    test.done();
  },
};

