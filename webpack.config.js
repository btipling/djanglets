var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./lib/runtime.js",
  },
  output: {
    path: "./lib/",
    filename: "djanglates_runtime.js",
    libraryTarget: "commonjs2",
    library: "djanglates"
  },
  externals: [
  ],
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("djanglates", "djanglates_runtime.js")
  ]
};
