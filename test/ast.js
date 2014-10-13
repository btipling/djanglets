"use strict";

var ast, visitor,
   djAst = require("../lib/djanglets/ast");

module.exports = {
  setUp: function (callback) {
    visitor = djAst.visitor;
    ast = djAst.createAst();
    visitor.visitOpenElement(ast, "template");
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testVisitOpenElementEndsText: function (test) {
    var ran = false;
    visitor.endText = function () {
      ran = true;
    }
    visitor.visitOpenElement(ast, "div");
    test.ok(ran, "Visiting an open element should end text.");
    test.done();
  },
  testVisitOpenElementCreatesElement: function (test) {
    var expectedLength;
    expectedLength = ast.state.nodeStack.length + 1;
    visitor.visitOpenElement(ast, "div");
    test.equal(ast.state.nodeStack.length, expectedLength, "Should have added a node.");
    test.done();
  },
  testVisitOpenElementRootRequiresTemplate: function (test) {
    visitor = djAst.visitor;
    ast = djAst.createAst();
    test.throws(function () {
      visitor.visitOpenElement(ast, "div");
    }, Error, "Root element must be a <template> element");
    test.done();
  },
  testVisitOpenElementTemplateAddsToAst: function (test) {
    visitor = djAst.visitor;
    ast = djAst.createAst();
    test.done();
  },
  testVisitOpenElementNodeAddedToChildren: function (test) {
    test.done();
  },
  testVisitOpenElementNodeAddedToNodeStack: function (test) {
    test.done();
  },
  testVisitOpenElementNodeEndsAttributes: function (test) {
    test.done();
  },
}
