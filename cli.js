var djanglates = require("./djanglates").parser,
    keys, index, key,
    contents,
    parsed,
    filename = "foo.html",
    yy = {},
    ast = require("./ast"),
    fs = require("fs");


contents = fs.readFileSync(filename, "utf-8");
keys = Object.keys(ast);
yy.visitor = ast.visitor;
yy.ast = ast.createAst();
console.log("wtf", yy.ast, yy.ast.initialize, yy.ast.getCurrentNode);
djanglates.yy = yy;
console.log('\n\ncontents\n\n');
console.log(contents);
parsed = djanglates.parse(contents);
console.log("\n\nresult:\n");
console.log(yy.ast.get());

