"use strict";

var ast, visitor,
   template = require("../lib/djanglets/template"),
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
    var el;
    visitor = djAst.visitor;
    ast = djAst.createAst();
    test.equal(ast.state.ast, null, "Ast starts as null");
    el = visitor.visitOpenElement(ast, template.TEMPLATE_TYPE);
    test.equal(el.type, template.TEMPLATE_TYPE, "Created element should be template type.");
    test.equal(ast.state.ast[0], el, "Template element added to ast.");
    test.done();
  },
  testVisitOpenElementNodeAddedToChildren: function (test) {
    var node, element;
    node = ast.getCurrentNode();
    element = visitor.visitOpenElement(ast, "div");
    test.equal(node.children[0], element, "New element should have been added to children.");
    test.done();
  },
  testVisitOpenElementNodeAddedToNodeStack: function (test) {
    var element;
    element = visitor.visitOpenElement(ast, "div");
    test.equal(ast.getCurrentNode(), element, "New element should be end of stack.");
    test.done();
  },
  testVisitOpenElementNodeEndsAttributes: function (test) {
    var ran = false;
    visitor.endAttributes = function () {
      ran = true;
    }
    visitor.visitOpenElement(ast, "div");
    test.ok(ran, "Should have ended attributes.");
    test.done();
  },
}
