[![Travis build test](https://travis-ci.org/btipling/djanglets.svg?branch=master)](https://travis-ci.org/btipling/djanglets)

djanglets
=========

djanglets is a reactive template engine inspired by the
[Django Template Language](https://docs.djangoproject.com/en/dev/topics/templates/).

This project is under heavy development and is still a prototype.

##Reactive rendering

The reactive aspects are currently only supported for meteor.js, but they will become available
regular JavaScript. The reactivity is such that changes in template variables update only
the elements that have changed, once the template has rendered. To achieve this the DOM
state exists in memory.


##Non-reactive rendering

It is also possible to use djanglets for non-reactive template rendering. In this case the
template is coerced into a string and rendered once with no state preserved in memory.


##Compatibility with Django templates

The goal is to make djanglets a superset of Django templates. Ultimately it would be nice
if any Django template were also capable of rendering with djanglets, but this aspect
is still being experimented with.


##Influences

In addition to similiarities to the Django Template Language this project is influenced by
handlebars.js meteor.js and react.js borrowing ideas and concepts from all of these and more.


##How does it work

Templates are parsed with [jison](http://zaach.github.io/jison/), and turned into an AST that
is written as JSON into JavaScript files. Separate runtimes exist for reactive and standard
template rendering.


##Examples and documentation

This project is still just getting started, there is an examples directory that I'm using
to develop static rendering and I have a separate repo for meteor templates that I will
make available soon.
