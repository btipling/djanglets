var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./lib/runtime.js",
  },
  output: {
    path: "./lib/",
    filename: "djanglets_runtime.js",
    libraryTarget: "commonjs2",
    library: "djanglets"
  },
  externals: [
  ],
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("djanglets", "djanglets_runtime.js")
  ]
};
