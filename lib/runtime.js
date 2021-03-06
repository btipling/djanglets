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
  var child;
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
      if (data.selfClosing) {
        visitor.visitSelfClosingElement(astObj, data.name);
        break;
      }
      visitor.visitOpenElement(astObj, data.name);
      if (data.children) {
        data.children.forEach(function (child) {
          buildNode(astObj, visitor, child);
        });
      }
      visitor.visitCloseElement(astObj);
      break;
    case template.type.IF:
      child = data.children.shift();
      visitor.visitComputeDjtag(astObj, template.type.IF, child.variable);
      //Every if has an elif, as the if is actually an elif owend in an if object.
      child.children.forEach(function (subChild) {
        buildNode(astObj, visitor, subChild);
      });
      //Any other elif or final else.
      data.children.forEach(function (child) {
        buildNode(astObj, visitor, child);
      });
      visitor.visitSignalDjtag(astObj, template.type.ENDIF);
      break;
    case template.type.ELIF:
      visitor.visitComputeDjtag(astObj, template.type.ELIF, data.variable);
      data.children.forEach(function (child) {
        buildNode(astObj, visitor, child);
      });
      break;
    case template.type.ELSE:
      visitor.visitSignalDjtag(astObj, template.type.ELSE);
      data.children.forEach(function (child) {
        buildNode(astObj, visitor, child);
      });
      break;
    case template.type.FOR:
      visitor.visitForDjtag(astObj, "for", data.key, data.value, "in", data.variable);
      data.children.forEach(function (child) {
        buildNode(astObj, visitor, child);
      });
      visitor.visitSignalDjtag(astObj, template.type.ENDFOR);
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
