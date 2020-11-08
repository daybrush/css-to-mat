/*
Copyright (c) 2019 Daybrush
name: css-to-mat
license: MIT
author: Daybrush
repository: git+https://github.com/daybrush/css-to-mat.git
version: 1.0.3
*/
'use strict';

var utils = require('@daybrush/utils');
var matrix = require('@scena/matrix');

function createMatrix() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function parseMat(transform) {
  return toMat(parse(transform));
}
function getElementMatrix(el) {
  return parseMat(getComputedStyle(el).transform);
}
function calculateMatrixDist(matrix$1, pos) {
  var res = matrix.calculate(matrix$1, [pos[0], pos[1] || 0, pos[2] || 0, 1], 4);
  var w = res[3] || 1;
  return [res[0] / w, res[1] / w, res[2] / w];
}
function getDistElementMatrix(el, container) {
  if (container === void 0) {
    container = document.body;
  }

  var target = el;
  var matrix$1 = createMatrix();

  while (target) {
    var transform = getComputedStyle(target).transform;
    matrix$1 = matrix.matrix3d(parseMat(transform), matrix$1);

    if (target === container) {
      break;
    }

    target = target.parentElement;
  }

  matrix$1 = matrix.invert(matrix$1, 4);
  matrix$1[12] = 0;
  matrix$1[13] = 0;
  matrix$1[14] = 0;
  return matrix$1;
}
function toMat(matrixInfos) {
  var target = createMatrix();
  matrixInfos.forEach(function (info) {
    var matrixFunction = info.matrixFunction,
        functionValue = info.functionValue;

    if (!matrixFunction) {
      return;
    }

    target = matrixFunction(target, functionValue);
  });
  return target;
}
function parse(transform) {
  var transforms = utils.isArray(transform) ? transform : utils.splitSpace(transform);
  return transforms.map(function (t) {
    var _a = utils.splitBracket(t),
        name = _a.prefix,
        value = _a.value;

    var matrixFunction = null;
    var functionName = name;
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

      matrixFunction = matrix.translate3d;
      functionValue = [posX, posY, posZ];
    } else if (name === "translateY") {
      var posY = parseFloat(value);
      matrixFunction = matrix.translate3d;
      functionValue = [0, posY, 0];
    } else if (name === "translateZ") {
      var posZ = parseFloat(value);
      matrixFunction = matrix.translate3d;
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

      matrixFunction = matrix.scale3d;
      functionValue = [sx, sy, sz];
    } else if (name === "scaleX") {
      var sx = parseFloat(value);
      matrixFunction = matrix.scale3d;
      functionValue = [sx, 1, 1];
    } else if (name === "scaleY") {
      var sy = parseFloat(value);
      matrixFunction = matrix.scale3d;
      functionValue = [1, sy, 1];
    } else if (name === "scaleZ") {
      var sz = parseFloat(value);
      matrixFunction = matrix.scale3d;
      functionValue = [1, 1, sz];
    } else if (name === "rotate" || name === "rotateZ" || name === "rotateX" || name === "rotateY") {
      var _h = utils.splitUnit(value),
          unit = _h.unit,
          unitValue = _h.value;

      var rad = unit === "rad" ? unitValue : unitValue * Math.PI / 180;

      if (name === "rotate" || name === "rotateZ") {
        functionName = "rotateZ";
        matrixFunction = matrix.rotateZ3d;
      } else if (name === "rotateX") {
        matrixFunction = matrix.rotateX3d;
      } else if (name === "rotateY") {
        matrixFunction = matrix.rotateY3d;
      }

      functionValue = rad;
    } else if (name === "matrix3d") {
      matrixFunction = matrix.matrix3d;
      functionValue = utils.splitComma(value).map(function (v) {
        return parseFloat(v);
      });
    } else if (name === "matrix") {
      var m = utils.splitComma(value).map(function (v) {
        return parseFloat(v);
      });
      matrixFunction = matrix.matrix3d;
      functionValue = [m[0], m[1], 0, 0, m[2], m[3], 0, 0, 0, 0, 1, 0, m[4], m[5], 0, 1];
    } else {
      functionName = "";
    }

    return {
      name: name,
      functionName: functionName,
      value: value,
      matrixFunction: matrixFunction,
      functionValue: functionValue
    };
  });
}

exports.calculateMatrixDist = calculateMatrixDist;
exports.createMatrix = createMatrix;
exports.getDistElementMatrix = getDistElementMatrix;
exports.getElementMatrix = getElementMatrix;
exports.parse = parse;
exports.parseMat = parseMat;
exports.toMat = toMat;
//# sourceMappingURL=css-to-mat.cjs.js.map
