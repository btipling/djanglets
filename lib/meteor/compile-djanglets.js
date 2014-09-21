function handler(compileStep) {
  console.log("dhtml compileStep", compileStep);
}

Plugin.registerSourceHandler("dhtml", handler);

