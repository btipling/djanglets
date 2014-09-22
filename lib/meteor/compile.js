var  ast = require("../djanglets/ast");

function handler(compileStep) {
  "use strict";
  var contents, outputFile,
    parsed, yy = {},
    result, output;


  contents = compileStep.read().toString("utf8");
  outputFile = compileStep.inputPath + ".js";

  yy.visitor = ast.visitor;
  yy.ast = ast.createAst();
  parser.yy = yy;
  parsed = parser.parse(contents);
  result = yy.ast.valueOf();
  output = "if (Meteor.isClient) {djanglets(" + JSON.stringify(result, null, 2) + ");}";
  compileStep.addJavaScript({
    path: outputFile,
    sourcePath: compileStep.inputPath,
    data: output,
    sourceMap: null,
    bare: compileStep.fileOptions.bare
  })
}

Plugin.registerSourceHandler("dhtml", handler);

