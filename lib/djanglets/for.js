"use strict";

var For,
    utils = require("./utils"),
    type = require("./template").type;

For = {};

/**
 * @param {string?} key
 * @param {string} value
 * @param {string} variable
 * @return {For}
 */
function createFor(key, value, variable) {
  key = key || "__KEY__";
  /**
   * @type {For}
   * @constructor
   */
  return Object.create(For, {
    /**
     * @type {string}
     */
    type: {
      value: type.FOR,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    key: {
      value: key,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    value: {
      value: value,
      enumerable: true,
    },
    /**
     * @type {string}
     */
    variable: {
      value: variable,
      enumerable: true,
    },
    /**
     * @type {Array.<Object>}
     */
    children: {
      value: [],
      enumerable: true,
    },
    valueOf: {
      value: function () {
        return {
          type: type.FOR,
          children: this.children.map(function (child) {
            return child.valueOf();
          }),
          key: this.key,
          value: this.value,
          variable: this.variable,
        };
      },
      enumerable: true,
    },
    preRender: {
      value: function () {
        var results = [], pieces;
        pieces = this.children.map(function (subchild) {
          if (subchild.hasOwnProperty("preRender")) {
            return subchild.preRender();
          } else {
            return subchild.toString();
          }
        }, this);
        utils.flattenPreRender(results, pieces);
        return [Object.create({}, {
          /**
           * @type {Array.<Object>}
           */
          children: {
            value: results,
            enumerable: true,
          },
          /**
           * @type {string}
           */
          key: {
            value: this.key,
            enumerable: true,
          },
          /**
           * @type {string}
           */
          value: {
            value: this.value,
            enumerable: true,
          },
          /**
           * @type {string}
           */
          variable: {
            value: this.variable,
            enumerable: true,
          },
          /**
           * @param {*=} opt_data
           * @return {string}
           */
          toString: {
            value: function (opt_data) {
              var results = [], data, loopData, idCount = 0, keys;
              data = opt_data || {};
              loopData = utils.getVariable(this.variable, data);
              if (Error.prototype.isPrototypeOf(loopData)) {
                return "";
              }
              switch(Object.prototype.toString.call(loopData)) {
                case "[object Array]":
                  return loopData.map(function (value, index) {
                    var childData, key, results;
                    key = "" + index;
                    childData = {__context__: data};
                    childData[this.key] = key;
                    childData[this.value] = value;
                    results = this.children.map(function (child) {
                      return child.toString(childData);
                    }).join("");
                    idCount++;
                    return results;
                  }, this).join("");
                case "[object Object]":
                  keys = Object.keys(loopData);
                  keys.forEach(function (key) {
                    var childData = {__context__: data};
                    childData[this.key] = key;
                    childData[this.value] = loopData[key];
                    results = results.concat(this.children.map(function (child) {
                      return child.toString(childData);
                    }));
                    idCount++;
                  }, this);
                  return results.join("");
              }
              return "";
            },
          },
        })];
      },
      enumerable: true,
    },
  });
}

module.exports = {
  For: For,
  createFor: createFor,
};
