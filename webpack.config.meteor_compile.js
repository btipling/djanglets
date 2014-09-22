var webpack = require("webpack"),
  FinishMeteorCompileBuild = require("./lib/meteor/finish_compile_build_plugin"),
  path = "./lib/meteor/",
  target = "built_compile.js";

module.exports = {
  entry: {
    app: "./lib/meteor/compile.js",
  },
  output: {
    path: path,
    filename: target,
  },
  externals: [
  ],
  plugins: [
    new FinishMeteorCompileBuild({targetPath: path + "/" + target})
  ],
};

