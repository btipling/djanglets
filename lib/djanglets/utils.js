"use strict";

var uniqueId,
    meteorVariable = require("../meteor/variable");

/**
 * @type {number}
 */
uniqueId = 0;

/**
 * @return {string}
 */
function getUniqueId() {
  uniqueId += 1;
  return "" + uniqueId;
}

/**
 * This function reduces multiple arrays into one, while concatonating strings. Strings
 * are concatonated until we reach an object, like a variable or an if. Strings and objects 
 * are put on the array, and then later, calling toString(DATA) on this will resolve
 * variables and if statements into strings and concatonate it all up into a single string.
 * @param {Array} results
 * @param {Array|string|ast} pieces
 * @param {string} currentString
 * @return {Array<results, string>}
 */
function flattenPreRender_ (results, pieces, currentString) {
  var results;

  pieces.forEach(function (piece) {
    if (typeof piece === "string") {
      currentString += piece;
    } else {
      if (Object.prototype.toString.call(piece) === "[object Array]") {
        /*
         * We want to build strings until we hit an object like a variable or an if, so we
         * modify `results`, while also returning currentString because we may be building
         * up this string some more inside the next recursive call to flattenPreRender.
         *
         * XXX: This recursion could blow up if the stack got too big, it would have to be
         * pretty big I think.
         */
        currentString = flattenPreRender_(results, piece, currentString);
      } else {
        if (currentString) {
          results.push(currentString);
        }
        currentString = "";
        results.push(piece);
      }
    }
  });
  return currentString;
}

/**
 * @param {Array} results
 * @param {Array} pieces
 */
function flattenPreRender (results, pieces) {
  var finalString = flattenPreRender_(results, pieces, "");
  if (finalString) {
    results.push(finalString);
  }
}

/**
 * Walk up data context to find the variable.
 * @param {string} name
 * @param {Object} data
 * @return {*|Error} Returns an error if not found.
 */
function getVariable_ (name, data) {
  var result;
  if (data.hasOwnProperty(name)) {
    if (meteorVariable.Variable.isPrototypeOf(data[name])) {
      return data[name].value;
    }
    return data[name];
  }
  if (data.__context__) {
    return getVariable(name, data.__context__);
  }
  return new Error("Not found");
}

/**
 * @param {Array.<string>} namespaces
 * @param {Object} data
 * @return {*|Error}
 */
function searchForNamespace (namespaces, data) {
  var result, currentPath;
  namespaces = [].concat(namespaces); //Create new array to modify given one.
  currentPath = namespaces.shift();
  result = getVariable_(currentPath, data);
  if (Error.prototype.isPrototypeOf(result) || !namespaces.length) {
    return result;
  }
  if (Object.prototype.toString.call(result) !== "[object Object]") {
    return new Error("Not found");
  }
  return searchForNamespace(namespaces, result);
}

/**
 * @param {Array.<string>} namespaces
 * @param {Array.<Object>} datas
 * @return {*|Error}
 */
function searchForData (namespaces, datas) {
  var result, data;
  datas = [].concat(datas); //Clone array to not modify it.
  data = datas.shift();
  result = searchForNamespace([].concat(namespaces), data);
  if (!Error.prototype.isPrototypeOf(result) || !datas.length) {
    return result;
  }
  return searchForData(namespaces, datas);
}

/**
 * @param {string} name
 * @param {Array.<Object>|Object} datas
 */
function getVariable (name, datas) {
  var result;
  if (Object.prototype.toString.call(datas) !== "[object Array]") {
    datas = [datas];
  }
  result = searchForData(name.split("."), datas);
  return result;
}

module.exports = {
  flattenPreRender: flattenPreRender,
  getUniqueId: getUniqueId,
  getVariable: getVariable,
};
