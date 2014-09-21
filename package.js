Package.describe({
  summary: "Djanglets templates for meteor.",
  version: "0.1.0",
  git: "https://github.com/btipling/djanglets",
});

Package.onUse(function(api) {
  console.log("onUse");
  api.versionsFrom("METEOR@0.9.2.2");
  api.addFiles("lib/meteor/djanglets.js");
  api.export("djanglets", "client");
});

Package._transitional_registerBuildPlugin({
    name: "compileDjanglets",
    use: [],
    sources: [
      "lib/meteor/compile-djanglets.js"
    ],
    npmDependencies: {}
});

Package.onTest(function(api) {
  api.use("tinytest");
  api.use("bjorn:djanglets");
  api.addFiles("lib/meteor/djanglets-tests.js");
});
