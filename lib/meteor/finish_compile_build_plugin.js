var fs = require("fs");

function FinishMeteorCompileBuild(options) {
  this.options = options || {};
}

FinishMeteorCompileBuild.prototype.apply = function(compiler) {
  var options = this.options,
      buildContents, djangletParser;
  compiler.plugin("done", function(compilation) {
    buildContents = fs.readFileSync(options.targetPath, "utf-8");
    djangletParser = fs.readFileSync("./lib/djanglets.js", "utf-8");
    fs.writeFile(options.targetPath, djangletParser + "\n\n\n" + buildContents);
  });
};
module.exports = FinishMeteorCompileBuild;
