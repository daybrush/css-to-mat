/*
Copyright (c) 2019 Daybrush
name: css-to-mat
license: MIT
author: Daybrush
repository: git+https://github.com/daybrush/css-to-mat.git
version: 1.0.3
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.CssToMatrix = factory());
}(this, function () { 'use strict';

  /*
  Copyright (c) 2018 Daybrush
  @name: @daybrush/utils
  license: MIT
  author: Daybrush
  repository: https://github.com/daybrush/utils
  @version 1.3.1
  */
  var OPEN_CLOSED_CHARACTER = ["\"", "'", "\\\"", "\\'"];
  /**
  * Check the type that the value is isArray.
  * @memberof Utils
  * @param {string} value - Value to check the type
  * @return {} true if the type is correct, false otherwise
  * @example
  import {isArray} from "@daybrush/utils";

  console.log(isArray([])); // true
  console.log(isArray({})); // false
  console.log(isArray(undefined)); // false
  console.log(isArray(null)); // false
  */

  function isArray(value) {
    return Array.isArray(value);
  }

  function findClosed(closedCharacter, texts, index, length) {
    for (var i = index; i < length; ++i) {
      var character = texts[i].trim();

      if (character === closedCharacter) {
        return i;
      }

      var nextIndex = i;

      if (character === "(") {
        nextIndex = findClosed(")", texts, i + 1, length);
      } else if (OPEN_CLOSED_CHARACTER.indexOf(character) > -1) {
        nextIndex = findClosed(character, texts, i + 1, length);
      }

      if (nextIndex === -1) {
        break;
      }

      i = nextIndex;
    }

    return -1;
  }

  function splitText(text, separator) {
    var regexText = "(\\s*" + (separator || ",") + "\\s*|\\(|\\)|\"|'|\\\\\"|\\\\'|\\s+)";
    var regex = new RegExp(regexText, "g");
    var texts = text.split(regex).filter(Boolean);
    var length = texts.length;
    var values = [];
    var tempValues = [];

    for (var i = 0; i < length; ++i) {
      var character = texts[i].trim();
      var nextIndex = i;

      if (character === "(") {
        nextIndex = findClosed(")", texts, i + 1, length);
      } else if (character === ")") {
        throw new Error("invalid format");
      } else if (OPEN_CLOSED_CHARACTER.indexOf(character) > -1) {
        nextIndex = findClosed(character, texts, i + 1, length);
      } else if (character === separator) {
        if (tempValues.length) {
          values.push(tempValues.join(""));
          tempValues = [];
        }

        continue;
      }

      if (nextIndex === -1) {
        nextIndex = length - 1;
      }

      tempValues.push(texts.slice(i, nextIndex + 1).join(""));
      i = nextIndex;
    }

    if (tempValues.length) {
      values.push(tempValues.join(""));
    }

    return values;
  }
  /**
  * divide text by space.
  * @memberof Utils
  * @param {string} text - text to divide
  * @return {Array} divided texts
  * @example
  import {spliceSpace} from "@daybrush/utils";

  console.log(splitSpace("a b c d e f g"));
  // ["a", "b", "c", "d", "e", "f", "g"]
  console.log(splitSpace("'a,b' c 'd,e' f g"));
  // ["'a,b'", "c", "'d,e'", "f", "g"]
  */

  function splitSpace(text) {
    // divide comma(,)
    return splitText(text, "");
  }
  /**
  * divide text by comma.
  * @memberof Utils
  * @param {string} text - text to divide
  * @return {Array} divided texts
  * @example
  import {splitComma} from "@daybrush/utils";

  console.log(splitComma("a,b,c,d,e,f,g"));
  // ["a", "b", "c", "d", "e", "f", "g"]
  console.log(splitComma("'a,b',c,'d,e',f,g"));
  // ["'a,b'", "c", "'d,e'", "f", "g"]
  */

  function splitComma(text) {
    // divide comma(,)
    // "[^"]*"|'[^']*'
    return splitText(text, ",");
  }
  /**
  * divide text by bracket "(", ")".
  * @memberof Utils
  * @param {string} text - text to divide
  * @return {object} divided texts
  * @example
  import {splitBracket} from "@daybrush/utils";

  console.log(splitBracket("a(1, 2)"));
  // {prefix: "a", value: "1, 2", suffix: ""}
  console.log(splitBracket("a(1, 2)b"));
  // {prefix: "a", value: "1, 2", suffix: "b"}
  */

  function splitBracket(text) {
    var matches = /([^(]*)\(([\s\S]*)\)([\s\S]*)/g.exec(text);

    if (!matches || matches.length < 4) {
      return {};
    } else {
      return {
        prefix: matches[1],
        value: matches[2],
        suffix: matches[3]
      };
    }
  }
  /**
  * divide text by number and unit.
  * @memberof Utils
  * @param {string} text - text to divide
  * @return {} divided texts
  * @example
  import {splitUnit} from "@daybrush/utils";

  console.log(splitUnit("10px"));
  // {prefix: "", value: 10, unit: "px"}
  console.log(splitUnit("-10px"));
  // {prefix: "", value: -10, unit: "px"}
  console.log(splitUnit("a10%"));
  // {prefix: "a", value: 10, unit: "%"}
  */

  function splitUnit(text) {
    var matches = /^([^\d|e|\-|\+]*)((?:\d|\.|-|e-|e\+)+)(\S*)$/g.exec(text);

    if (!matches) {
      return {
        prefix: "",
        unit: "",
        value: NaN
      };
    }

    var prefix = matches[1];
    var value = matches[2];
    var unit = matches[3];
    return {
      prefix: prefix,
      unit: unit,
      value: parseFloat(value)
    };
  }

  /*
  Copyright (c) 2018 Daybrush
  @name: @daybrush/utils
  license: MIT
  author: Daybrush
  repository: https://github.com/daybrush/utils
  @version 1.3.1
  */

  /*
  Copyright (c) 2020 Daybrush
  name: @scena/matrix
  license: MIT
  author: Daybrush
  repository: git+https://github.com/daybrush/matrix
  version: 1.0.0
  */

  function add(matrix, inverseMatrix, startIndex, fromIndex, n, k) {
    for (var i = 0; i < n; ++i) {
      var x = startIndex + i * n;
      var fromX = fromIndex + i * n;
      matrix[x] += matrix[fromX] * k;
      inverseMatrix[x] += inverseMatrix[fromX] * k;
    }
  }

  function swap(matrix, inverseMatrix, startIndex, fromIndex, n) {
    for (var i = 0; i < n; ++i) {
      var x = startIndex + i * n;
      var fromX = fromIndex + i * n;
      var v = matrix[x];
      var iv = inverseMatrix[x];
      matrix[x] = matrix[fromX];
      matrix[fromX] = v;
      inverseMatrix[x] = inverseMatrix[fromX];
      inverseMatrix[fromX] = iv;
    }
  }

  function divide(matrix, inverseMatrix, startIndex, n, k) {
    for (var i = 0; i < n; ++i) {
      var x = startIndex + i * n;
      matrix[x] /= k;
      inverseMatrix[x] /= k;
    }
  }
  function invert(matrix, n) {
    if (n === void 0) {
      n = Math.sqrt(matrix.length);
    }

    var newMatrix = matrix.slice();
    var inverseMatrix = createIdentityMatrix(n);

    for (var i = 0; i < n; ++i) {
      // diagonal
      var identityIndex = n * i + i;

      if (newMatrix[identityIndex] === 0) {
        for (var j = i + 1; j < n; ++j) {
          if (newMatrix[n * i + j]) {
            swap(newMatrix, inverseMatrix, i, j, n);
            break;
          }
        }
      }

      if (newMatrix[identityIndex]) {
        divide(newMatrix, inverseMatrix, i, n, newMatrix[identityIndex]);
      } else {
        // no inverse matrix
        return [];
      }

      for (var j = 0; j < n; ++j) {
        var targetStartIndex = j;
        var targetIndex = j + i * n;
        var target = newMatrix[targetIndex];

        if (target === 0 || i === j) {
          continue;
        }

        add(newMatrix, inverseMatrix, targetStartIndex, i, n, -target);
      }
    }

    return inverseMatrix;
  }
  function multiply(matrix, matrix2, n) {
    if (n === void 0) {
      n = Math.sqrt(matrix.length);
    }

    var newMatrix = []; // 1 y: n
    // 1 x: m
    // 2 x: m
    // 2 y: k
    // n * m X m * k

    var m = matrix.length / n;
    var k = matrix2.length / m;

    if (!m) {
      return matrix2;
    } else if (!k) {
      return matrix;
    }

    for (var i = 0; i < n; ++i) {
      for (var j = 0; j < k; ++j) {
        newMatrix[j * n + i] = 0;

        for (var l = 0; l < m; ++l) {
          // m1 x: m(l), y: n(i)
          // m2 x: k(j):  y: m(l)
          // nw x: n(i), y: k(j)
          newMatrix[j * n + i] += matrix[l * n + i] * matrix2[j * m + l];
        }
      }
    } // n * k


    return newMatrix;
  }
  function calculate(matrix, matrix2, n) {
    if (n === void 0) {
      n = matrix2.length;
    }

    var result = multiply(matrix, matrix2, n);
    var k = result[n - 1];
    return result.map(function (v) {
      return v / k;
    });
  }
  function rotateX3d(matrix, rad) {
    return multiply(matrix, [1, 0, 0, 0, 0, Math.cos(rad), Math.sin(rad), 0, 0, -Math.sin(rad), Math.cos(rad), 0, 0, 0, 0, 1], 4);
  }
  function rotateY3d(matrix, rad) {
    return multiply(matrix, [Math.cos(rad), 0, -Math.sin(rad), 0, 0, 1, 0, 0, Math.sin(rad), 0, Math.cos(rad), 0, 0, 0, 0, 1], 4);
  }
  function rotateZ3d(matrix, rad) {
    return multiply(matrix, createRotateMatrix(rad, 4));
  }
  function scale3d(matrix, _a) {
    var _b = _a[0],
        sx = _b === void 0 ? 1 : _b,
        _c = _a[1],
        sy = _c === void 0 ? 1 : _c,
        _d = _a[2],
        sz = _d === void 0 ? 1 : _d;
    return multiply(matrix, [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1], 4);
  }
  function translate3d(matrix, _a) {
    var _b = _a[0],
        tx = _b === void 0 ? 0 : _b,
        _c = _a[1],
        ty = _c === void 0 ? 0 : _c,
        _d = _a[2],
        tz = _d === void 0 ? 0 : _d;
    return multiply(matrix, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1], 4);
  }
  function matrix3d(matrix1, matrix2) {
    return multiply(matrix1, matrix2, 4);
  }
  function createRotateMatrix(rad, n) {
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);
    var m = createIdentityMatrix(n); // cos -sin
    // sin cos

    m[0] = cos;
    m[1] = sin;
    m[n] = -sin;
    m[n + 1] = cos;
    return m;
  }
  function createIdentityMatrix(n) {
    var length = n * n;
    var matrix = [];

    for (var i = 0; i < length; ++i) {
      matrix[i] = i % (n + 1) ? 0 : 1;
    }

    return matrix;
  }

  function createMatrix() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
  function parseMat(transform) {
    return toMat(parse(transform));
  }
  function getElementMatrix(el) {
    return parseMat(getComputedStyle(el).transform);
  }
  function calculateMatrixDist(matrix, pos) {
    var res = calculate(matrix, [pos[0], pos[1] || 0, pos[2] || 0, 1], 4);
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
      matrix = matrix3d(parseMat(transform), matrix);

      if (target === container) {
        break;
      }

      target = target.parentElement;
    }

    matrix = invert(matrix, 4);
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    return matrix;
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
    var transforms = isArray(transform) ? transform : splitSpace(transform);
    return transforms.map(function (t) {
      var _a = splitBracket(t),
          name = _a.prefix,
          value = _a.value;

      var matrixFunction = null;
      var functionName = name;
      var functionValue = "";

      if (name === "translate" || name === "translateX" || name === "translate3d") {
        var _b = splitComma(value).map(function (v) {
          return parseFloat(v);
        }),
            posX = _b[0],
            _c = _b[1],
            posY = _c === void 0 ? 0 : _c,
            _d = _b[2],
            posZ = _d === void 0 ? 0 : _d;

        matrixFunction = translate3d;
        functionValue = [posX, posY, posZ];
      } else if (name === "translateY") {
        var posY = parseFloat(value);
        matrixFunction = translate3d;
        functionValue = [0, posY, 0];
      } else if (name === "translateZ") {
        var posZ = parseFloat(value);
        matrixFunction = translate3d;
        functionValue = [0, 0, posZ];
      } else if (name === "scale" || name === "scale3d") {
        var _e = splitComma(value).map(function (v) {
          return parseFloat(v);
        }),
            sx = _e[0],
            _f = _e[1],
            sy = _f === void 0 ? sx : _f,
            _g = _e[2],
            sz = _g === void 0 ? 1 : _g;

        matrixFunction = scale3d;
        functionValue = [sx, sy, sz];
      } else if (name === "scaleX") {
        var sx = parseFloat(value);
        matrixFunction = scale3d;
        functionValue = [sx, 1, 1];
      } else if (name === "scaleY") {
        var sy = parseFloat(value);
        matrixFunction = scale3d;
        functionValue = [1, sy, 1];
      } else if (name === "scaleZ") {
        var sz = parseFloat(value);
        matrixFunction = scale3d;
        functionValue = [1, 1, sz];
      } else if (name === "rotate" || name === "rotateZ" || name === "rotateX" || name === "rotateY") {
        var _h = splitUnit(value),
            unit = _h.unit,
            unitValue = _h.value;

        var rad = unit === "rad" ? unitValue : unitValue * Math.PI / 180;

        if (name === "rotate" || name === "rotateZ") {
          functionName = "rotateZ";
          matrixFunction = rotateZ3d;
        } else if (name === "rotateX") {
          matrixFunction = rotateX3d;
        } else if (name === "rotateY") {
          matrixFunction = rotateY3d;
        }

        functionValue = rad;
      } else if (name === "matrix3d") {
        matrixFunction = matrix3d;
        functionValue = splitComma(value).map(function (v) {
          return parseFloat(v);
        });
      } else if (name === "matrix") {
        var m = splitComma(value).map(function (v) {
          return parseFloat(v);
        });
        matrixFunction = matrix3d;
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



  var others = ({
    parse: parse,
    parseMat: parseMat,
    toMat: toMat,
    getDistElementMatrix: getDistElementMatrix,
    calculateMatrixDist: calculateMatrixDist,
    getElementMatrix: getElementMatrix,
    createMatrix: createMatrix
  });

  return others;

}));
//# sourceMappingURL=css-to-mat.js.map
