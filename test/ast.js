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
    test.ok(djAst.Ast.isPrototypeOf(ast), "Should have created an ast.");
    test.done();
  },
  testAstAddNode: function (test) {
    test.equal(ast.state.nodeStack[0], undefined, "Should not have any nodes.");
    ast.addNodeToStack("foo");
    test.equal(ast.state.nodeStack[0], "foo", "Should have added node to stack.");
    test.done();
  },
  testAstGetCurrentNode: function (test) {
    test.ok(!ast.getCurrentNode(), "Should not have any nodes yet.");
    ast.addNodeToStack("foo");
    test.equal(ast.getCurrentNode(), "foo", "Should have gotten current node.");
    test.done();
  },
  testPopNodeStack: function (test) {
    ast.addNodeToStack("foo");
    test.equal(ast.getCurrentNode(), "foo", "Should have gotten current node.");
    ast.popNodeStack()
    test.ok(!ast.getCurrentNode(), "Should not have any any more nodes.");
    test.done();
  },
  testValueOf: function (test) {
    var expect = [{"foo": "bar"}];
    ast.state.ast = expect;
    test.deepEqual(expect, ast.valueOf());
    test.done();
  },
  testState: function (test) {
    console.log(ast.state);
    ast.state.ast = ["foo"];
    test.deepEqual(ast.state, {
      currentText: '',
      nodeStack: [],
      currentAttributes: [],
      processState: [djAst.Ast.states.INITIAL],
      ast: ["foo"],
    });
    test.done();
  },
};

