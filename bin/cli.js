#!/usr/bin/env node
"use strict";
var djanglets = require("../lib/djanglets").parser,
    argv = require('yargs'),
    contents, parsed, filename, yy = {},
    ast = require("../lib/djanglets/ast"),
    util = require("util"),
    fs = require("fs"),
    result, fileContent,
    outFilename = "build.templets.js";


argv = argv.usage('Compile a djanglate template.\nUsage: $0 template')
 .example('$0 -o filename', 'Output file name.')
 .demand(1)
 .alias('o', 'output')
 .describe('o', 'Output file name')
 .argv;

outFilename = argv.output || outFilename;
filename = argv._[0]

contents = fs.readFileSync(filename, "utf-8");
yy.visitor = ast.visitor;
yy.ast = ast.createAst();
djanglets.yy = yy;
parsed = djanglets.parse(contents);
result = yy.ast.valueOf();
//console.log("result", JSON.stringify(result, null, 1));
fileContent = "djanglets(" + JSON.stringify(result, null, 1) + ");";

fs.writeFile(outFilename, fileContent, function(err) {
  if(err) {
    console.log("Error saving template", err);
  } else {
    console.log("Template saved to", outFilename);
  }
}); 
