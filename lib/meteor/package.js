Package.describe({
  summary: " \* Fill me in! *\ ",
  version: "1.0.0",
  git: " \* Fill me in! *\ "
});

Package.onUse(function(api) {
//  api.versionsFrom('METEOR@0.9.2.2');
  api.addFiles('bjorn:djanglets.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('bjorn:djanglets');
  api.addFiles('bjorn:djanglets-tests.js');
});
