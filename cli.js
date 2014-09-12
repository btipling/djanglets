var djanglates = require("./djanglates"),
    filename = "foo.html",
    contents,
    parsed,
    fs = require("fs");


contents = fs.readFileSync(filename, "utf-8");
console.log(djanglates);
console.log('\n\ncontents\n\n');
console.log(contents);
parsed = djanglates.parse(contents);
console.log("\n\nresult:\n");
console.log(parsed);

