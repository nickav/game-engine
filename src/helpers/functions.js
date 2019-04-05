import { fn } from 'hibar';
import { m4, v3 } from 'twgl.js';

/** Linear interpolation. */
export const lerp = (a, b, t) => (1 - t) * a + t * b;

/** Clamps val between [min, max] inclusive. */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const assert = (truthy, message) => {
  if (!truthy) {
    console.error(message);
  }

  return !!truthy;
};

/** Find the angle of a segment from (x1, y1) -> (x2, y2). */
export const angleBetween = (x1, y1, x2, y2) => Math.atan2(y1 - y2, x2 - x1);

export const rectAbs = ({ x, y, width, height }) => ({
  x: width < 0 ? x + width : x,
  y: height < 0 ? y + height : y,
  width: Math.abs(width),
  height: Math.abs(height),
});

export const rectIntersect = (rect1, rect2) =>
  rect1.x < rect2.x + rect2.width &&
  rect1.x + rect1.width > rect2.x &&
  rect1.y < rect2.y + rect2.height &&
  rect1.height + rect1.y > rect2.y;

export const stripExt = (str) => {
  const lastIndex = str.lastIndexOf('.');
  return lastIndex < 0 ? str : str.substr(0, lastIndex);
};

export const nullCheck = (array, offset, count, name) => {
  const length = array.length;

  for (let i = 0; i < count; i++) {
    const index = offset + i;
    const value = array[index];

    if (typeof value !== 'number' || Number.isNaN(value)) {
      return true;
    }
  }

  return false;
};

/**
 * Remove a range of items from an array
 * @see {@link https://github.com/mreinstein/remove-array-items}
 *
 * @function removeItems
 * @param {Array<*>} arr The target array
 * @param {number} startIdx The index to begin removing from (inclusive)
 * @param {number} removeCount How many items to remove
 */
export const removeItems = (arr, startIdx, removeCount) => {
  var i,
    length = arr.length;

  if (startIdx >= length || removeCount === 0) {
    return;
  }

  removeCount =
    startIdx + removeCount > length ? length - startIdx : removeCount;

  var len = length - removeCount;

  for (i = startIdx; i < len; ++i) {
    arr[i] = arr[i + removeCount];
  }

  arr.length = len;
};

/**
 * Takes a 4-by-4 matrix and a point.
 * Adapted from twgl.transformPoint
 */
export const transformPoint = (m, v, dst) => {
  dst = dst || { x: 0, y: 0 };
  var v0 = v.x;
  var v1 = v.y;
  var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + m[3 * 4 + 3];
  dst.x = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + m[3 * 4 + 0]) / d;
  dst.y = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + m[3 * 4 + 1]) / d;
  return dst;
};

/**!
 * Copyright 2011 THEtheChad Elliott
 * Released under the MIT and GPL licenses.
 * @see {@link https://gist.github.com/THEtheChad/1297590/c67e4e44b190252e9bddb44183341027bdbf6e74}
 *
 * Parse hex/rgb{a} color syntax.
 * @input string
 * @returns array [r,g,b{,o}]
 */

// #ffffff
const HEX_SIX_REG = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/;
// #fff
const HEX_THREE_REG = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/;
// rgba(255, 255, 255, 1)
const RGBA_REG = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/;
// rgb(255, 255, 255)
const RGB_REG = /^rgb\(([\d]+),([\d]+),([\d]+)\)/;

const parseColorString = (colorStr) => {
  if (!colorStr) {
    return [0, 0, 0, 1];
  }

  const p = parseInt;
  const color = colorStr.replace(/\s\s*/g, '');
  let cache;

  if ((cache = HEX_SIX_REG.exec(color))) {
    // Checks for 6 digit hex and converts string to integer
    cache = [p(cache[1], 16), p(cache[2], 16), p(cache[3], 16)];
  } else if ((cache = HEX_THREE_REG.exec(color))) {
    // Checks for 3 digit hex and converts string to integer
    cache = [p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17];
  } else if ((cache = RGBA_REG.exec(color))) {
    // Checks for rgba and converts string to
    // integer/float using unary + operator to save bytes
    cache = [+cache[1], +cache[2], +cache[3], +cache[4]];
  } else if ((cache = RGB_REG.exec(color))) {
    // Checks for rgb and converts string to
    cache = [+cache[1], +cache[2], +cache[3]];
  } else {
    throw Error(`parseColor: ${color} is not supported`);
  }

  if (isNaN(cache[3])) cache[3] = 1;

  return cache;
};

export const parseColor = fn.memoize(parseColorString);

export const stringifyColor = (color) => {
  const [r, g, b, a] = color;

  const hex = `#${(r * 255).toString(16)}${(g * 255).toString(16)}${(
    b * 255
  ).toString(16)}`;

  return a || a !== 1 ? `${hex}${(a * 255).toString(16)}` : hex;
};

export const rotateView = (mat, x, y, radians) => {
  const translation = v3.create(x, y, 0);
  const newMatrix = m4.translate(mat, translation);
  m4.rotateZ(newMatrix, radians, newMatrix);
  m4.translate(newMatrix, v3.negate(translation), newMatrix);
  return newMatrix;
};
