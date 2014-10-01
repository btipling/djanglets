"use strict";

var djIf = require("../lib/djanglets/if"),
    djElement = require("../lib/djanglets/element"),
    template = require("../lib/djanglets/template");

module.exports = {
  setUp: function (callback) {
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  testCreateIf: function (test) {
    var ifStatement;
    ifStatement = djIf.createIf("foo");
    test.ok(djIf.If.isPrototypeOf(ifStatement), "Should create a djanglets if.");
    test.equal(ifStatement.type, template.type.IF, "Should be an if type.");
    test.done();
  },
  testCreateElif: function (test) {
    var elifStatement, expected = "foo";
    elifStatement = djIf.createElif("foo");
    test.ok(djIf.Elif.isPrototypeOf(elifStatement), "Should create a djanglets elif.");
    test.equal(elifStatement.type, template.type.ELIF, "Should be an elif type.");
    test.equal(elifStatement.variable, expected, "Should have the expected variable name.");
    test.done();
  },
  testCreateElse: function (test) {
    var elseStatement;
    elseStatement = djIf.createElse();
    test.ok(djIf.Else.isPrototypeOf(elseStatement), "Should create a djanglets else.");
    test.equal(elseStatement.type, template.type.ELSE, "Should be an else type.");
    test.done();
  },
  testIfLogic: function (test) {
    var ifStatement, preRendered, expected;
    ifStatement = djIf.createIf();
    ifStatement.children.push(djIf.createElif("foo"));
    ifStatement.children[0].children.push(djElement.createElement());
    ifStatement.children[0].children[0].type = "SPAN";
    ifStatement.children[0].children[0].children.push("A text node for if.");
    ifStatement.children.push(djIf.createElse());
    ifStatement.children[1].children.push(djElement.createElement());
    ifStatement.children[1].children[0].type = "DIV";
    ifStatement.children[1].children[0].children.push("A text node for else.");
    preRendered = ifStatement.preRender()[0];
    expected = "<SPAN>A text node for if.</SPAN>";
    test.equal(preRendered.toString({foo: true}), expected, "Should have yielded if state.");
    expected = "<DIV>A text node for else.</DIV>";
    test.equal(preRendered.toString({foo: false}), expected, "Should have yielded else state.");
    test.done();
  },
};


