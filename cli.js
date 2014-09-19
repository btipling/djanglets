"use strict";
var djanglates = require("./djanglates").parser,
    keys, index, key,
    contents,
    parsed,
    filename = "foo.html",
    yy = {},
    ast = require("./ast"),
    util = require("util"),
    fs = require("fs"),
    result, fileContent,
    outFilename = "build.templates.js";


contents = fs.readFileSync(filename, "utf-8");
keys = Object.keys(ast);
yy.visitor = ast.visitor;
yy.ast = ast.createAst();
djanglates.yy = yy;
parsed = djanglates.parse(contents);
result = yy.ast.valueOf();
fileContent = "djanglets(" + JSON.stringify(result, null, 2) + ")";

fs.writeFile(outFilename, fileContent, function(err) {
  if(err) {
    console.log("Error saving template", err);
  } else {
    console.log("Template saved to ", outFilename);
  }
}); 
