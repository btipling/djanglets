var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./lib/runtime.js",
  },
  output: {
    path: "./lib/",
    filename: "djanglets_runtime.js",
    libraryTarget: "var",
    library: "djanglets"
  },
  externals: [
  ],
  plugins: [
  ]
};
