/*
Copyright (c) 2019 Daybrush
name: css-to-mat
license: MIT
author: Daybrush
repository: git+https://github.com/daybrush/css-to-mat.git
version: 0.1.6
*/
'use strict';

var glMatrix = require('gl-matrix');
var utils = require('@daybrush/utils');

function createMatrix() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function parseMat(transform) {
  return toMat(parse(transform));
}
function getElementMatrix(el) {
  return parseMat(getComputedStyle(el).transform);
}
function caculateMatrixDist(matrix, pos) {
  var res = glMatrix.mat4.multiply(createMatrix(), matrix, [pos[0], pos[1] || 0, pos[2] || 0, 1]);
  var w = res[3] || 1;
  return [res[0] / w, res[1] / w, res[2] / w];
}
function getDistElementMatrix(el, container) {
  if (container === void 0) {
    container = document.body;
  }

  var target = el;
  var matrix = createMatrix();

  while (target) {
    var transform = getComputedStyle(target).transform;
    glMatrix.mat4.multiply(matrix, parseMat(transform), matrix);

    if (target === container) {
      break;
    }

    target = target.parentElement;
  }

  glMatrix.mat4.invert(matrix, matrix);
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 0;
  return matrix;
}
function toMat(matrixInfos) {
  var target = createMatrix();
  matrixInfos.forEach(function (info) {
    var functionName = info.functionName,
        functionValue = info.functionValue;

    if (!functionName) {
      return;
    }

    glMatrix.mat4[functionName](target, target, functionValue);
  });
  return target;
}
function parse(transform) {
  var transforms = utils.isArray(transform) ? transform : utils.splitSpace(transform);
  return transforms.map(function (t) {
    var _a = utils.splitBracket(t),
        name = _a.prefix,
        value = _a.value;

    var functionName = "";
    var functionValue = "";

    if (name === "translate" || name === "translateX" || name === "translate3d") {
      var _b = utils.splitComma(value).map(function (v) {
        return parseFloat(v);
      }),
          posX = _b[0],
          _c = _b[1],
          posY = _c === void 0 ? 0 : _c,
          _d = _b[2],
          posZ = _d === void 0 ? 0 : _d;

      functionName = "translate";
      functionValue = [posX, posY, posZ];
    } else if (name === "translateY") {
      var posY = parseFloat(value);
      functionName = "translate";
      functionValue = [0, posY, 0];
    } else if (name === "translateZ") {
      var posZ = parseFloat(value);
      functionName = "translate";
      functionValue = [0, 0, posZ];
    } else if (name === "scale" || name === "scale3d") {
      var _e = utils.splitComma(value).map(function (v) {
        return parseFloat(v);
      }),
          sx = _e[0],
          _f = _e[1],
          sy = _f === void 0 ? sx : _f,
          _g = _e[2],
          sz = _g === void 0 ? 1 : _g;

      functionName = "scale";
      functionValue = [sx, sy, sz];
    } else if (name === "scaleX") {
      var sx = parseFloat(value);
      functionName = "scale";
      functionValue = [sx, 1, 1];
    } else if (name === "scaleY") {
      var sy = parseFloat(value);
      functionName = "scale";
      functionValue = [1, sy, 1];
    } else if (name === "scaleZ") {
      var sz = parseFloat(value);
      functionName = "scale";
      functionValue = [1, 1, sz];
    } else if (name === "rotate" || name === "rotateZ" || name === "rotateX" || name === "rotateY") {
      var _h = utils.splitUnit(value),
          unit = _h.unit,
          unitValue = _h.value;

      var rad = unit === "rad" ? unitValue : unitValue * Math.PI / 180;
      functionName = name === "rotate" ? "rotateZ" : name;
      functionValue = rad;
    } else if (name === "matrix3d") {
      functionName = "multiply";
      functionValue = utils.splitComma(value).map(function (v) {
        return parseFloat(v);
      });
    } else if (name === "matrix") {
      var m = utils.splitComma(value).map(function (v) {
        return parseFloat(v);
      });
      functionName = "multiply";
      functionValue = [m[0], m[1], 0, 0, m[2], m[3], 0, 0, 0, 0, 1, 0, m[4], m[5], 0, 1];
    }

    return {
      name: name,
      value: value,
      functionName: functionName,
      functionValue: functionValue
    };
  });
}

exports.caculateMatrixDist = caculateMatrixDist;
exports.createMatrix = createMatrix;
exports.getDistElementMatrix = getDistElementMatrix;
exports.getElementMatrix = getElementMatrix;
exports.parse = parse;
exports.parseMat = parseMat;
exports.toMat = toMat;
//# sourceMappingURL=css-to-mat.cjs.js.map
