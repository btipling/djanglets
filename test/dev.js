var template, html;
template = djanglets[djanglets.templates[0]];
console.log("before");
html = template.toString({
  foovar: "<p>Whatup</p>",
  fooifcheck: false,
  fooelifcheck: true,
  foos: {
    dog: "woof",
    cows: "moo",
  },
  foosR: [
    "red",
    "white",
    "blue",
  ],
});
console.log("after", html);
document.getElementById("result").innerHTML = html;

