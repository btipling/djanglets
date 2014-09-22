var webpack = require("webpack"),
  path = "./lib/meteor/",
  target = "built_runtime.js";

module.exports = {
  entry: {
    app: "./lib/meteor/runtime.js",
  },
  output: {
    path: path,
    filename: target,
  },
  externals: [
  ],
  plugins: [
  ],
};

