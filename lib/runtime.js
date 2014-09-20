"use strict";
var djanglets,
    template = require("./djanglets/template"),
    ast = require("./djanglets/ast");

/**
 * @param {ast} astObj
 * @param {ast.visitor} visitor
 * @param {Object} data
 */
function buildNode(astObj, visitor, data) {
  if (typeof data === "string") {
    visitor.visitText(astObj, data);
    return;
  }
  switch (data.type) {
    case template.type.ELEMENT:
      if (data.attributes) {
        data.attributes.forEach(function (attribute) {
          visitor.visitAttribute(astObj, attribute.name, attribute.value);
        });
      }
      visitor.visitOpenElement(astObj, data.name);
      if (data.children) {
        data.children.forEach(function (child) {
          buildNode(astObj, visitor, child);
        });
      }
      visitor.visitCloseElement(astObj);
      break;
    case template.type.VARIABLE:
      visitor.visitVariable(astObj, data.name);
      break;
  }
}

/**
 * @param {Array.<astObj>}
 */
function djanglets(templatesData) {
  var astObj, visitor, templatesAst;
  console.log(templatesData);
  astObj = ast.createAst();
  visitor = ast.visitor;
  templatesData.forEach(function (data) {
    buildNode(astObj, visitor, data);
  }, this);
  templatesAst = astObj.get();
  templatesAst.forEach(function (templateAst) {
    var t;
    t = template.buildTemplate(templateAst);
    djanglets[t.name] = t;
  });
}

module.exports = djanglets;
