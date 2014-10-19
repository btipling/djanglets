var reporter = require('nodeunit').reporters.default;
reporter.run([
  "test",
], null, function (failed) {
  if (failed) {
    process.exit(1);
  }
});

