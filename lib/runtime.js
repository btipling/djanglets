"use strict";
//something
var djanglets,
    template = require("./djanglets/template"),
    ast = require("./djanglets/ast");

/**
 * @param {ast} astObj
 * @param {ast.visitor} visitor
 * @param {Object} data
 */
function buildNode(astObj, visitor, data) {
  nope; //Has to be rewritten pretty much entirely.
}

/**
 * @param {Array.<astObj>}
 */
function djanglets(templatesData) {
  var astObj, visitor, templatesAst;
  if (document.characterSet.toLowerCase() !== "utf-8") {
    console.log([
      "WARNING!",
      "djanglets only works with the utf-8 characterSet,",
      "add a <meta charset=\"utf-8\"> , your encoding:",
      "'" + document.characterSet.toLowerCase() + "'",
    ].join(" "));
  }
  console.log(templatesData);
  astObj = ast.createAst();
  visitor = ast.visitor;
  templatesData.forEach(function (data) {
    buildNode(astObj, visitor, data);
  });
  templatesAst = astObj.get();
  djanglets.templates = [];
  templatesAst.forEach(function (templateAst) {
    var t;
    t = template.buildTemplate(templateAst);
    djanglets[t.name] = t;
    djanglets.templates.push(t.name);
  });
}

module.exports = djanglets;
