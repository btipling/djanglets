var template, html;
template = djanglets[djanglets.templates[0]];
html = template.toString({foovar: "<p>Whatup</p>"});
document.getElementById("result").innerHTML = html;

