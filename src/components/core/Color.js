import { parseColor, stringifyColor } from '@/helpers/functions';

export default class Color {
  static WHITE = Object.freeze([1, 1, 1, 1]);

  static BLACK = Object.freeze([0, 0, 0, 1]);

  static make = (r, g, b, a = 1) => [r, g, b, a];

  static rgb = (r, g, b, a = 1) => [r / 255, g / 255, b / 255, a];

  static parse = parseColor;

  static stringify = stringifyColor;

  static mul = (c1, c2) => [
    c1[0] * c2[0],
    c1[1] * c2[1],
    c1[2] * c2[2],
    c1[3] * c1[3],
  ];

  static mulAlpha = (c1, alpha) => {
    const [r, g, b, a] = c1;
    return [r, g, b, a * alpha];
  };
}
