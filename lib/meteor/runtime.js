var runtime = require("../runtime"),
    template = require("./template");

djanglets = function () {
  runtime.apply(this, arguments);
  djanglets.templates = runtime.templates;
  djanglets.templates.forEach(function (templateName) {
    djanglets[templateName] = template.create(runtime[templateName]);
  });
}
