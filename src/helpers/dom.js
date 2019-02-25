import * as twgl from 'twgl.js';
import { fn } from 'hibar';
import { stringifyColor } from '@/helpers/functions';

export const requestFullscreen = (el) => {
  const fn =
    el.requestFullscreen ||
    el.mozRequestFullScreen ||
    el.webkitRequestFullScreen ||
    el.msRequestFullscreen;

  if (fn) return fn.call(el);
};

export const exitFullscreen = (el) => {
  const fn =
    el.exitFullscreen ||
    el.mozCancelFullScreen ||
    el.webkitCancelFullScreen ||
    el.msExitFullscreen;

  if (fn) return fn();
};

const span = document.createElement('span');

const getFontAttribute = (fontStyle, text, attr) => {
  // apply styles
  document.body.appendChild(span);
  span.innerText = text;
  span.setAttribute(
    'style',
    `font:${fontStyle};white-space:pre;opacity:0;position:absolute;top:0;left:0;`
  );
  // calculate height
  const value = span[attr];
  document.body.removeChild(span);
  return value;
};

export const getFontHeight = fn.memoize((fontStyle, text) =>
  getFontAttribute(fontStyle, text || 'gM', 'offsetHeight')
);

export const getFontWidth = fn.memoize((fontStyle, text) =>
  getFontAttribute(fontStyle, text, 'offsetWidth')
);
window.getFontWidth = getFontWidth;

const defaultStyle = {
  font: '10px monospace',
  fillStyle: '#ffffff',
};

const ctx = document.createElement('canvas').getContext('2d');
//document.body.appendChild(ctx.canvas);
//ctx.canvas.style.position = 'relative';

const buildDynamicText = (text, style = {}, x = 0, y = 0) => {
  const { canvas } = ctx;

  if (typeof text === 'undefined') {
    console.error('buildDynamicText: Missing required argument text');
    return;
  }

  // create text properties
  text = text.toString();
  style = { ...defaultStyle, ...style };
  style.fillStyle = style.color
    ? stringifyColor(style.color)
    : style.fillStyle || '#ffffff';

  ctx.font = style.font;
  const t = ctx.measureText(text);

  style.letterSpacing =
    (typeof style.letterSpacing === 'string'
      ? parseInt(style.letterSpacing, 10)
      : style.letterSpacing) || 0;

  const letterSpacing = style.letterSpacing || 0;
  const padding = style.shadowBlur || 0;
  const width =
    Math.ceil(t.width) + letterSpacing * (text.length - 1) + padding;
  const height = getFontHeight(style.font);
  const scale = window.devicePixelRatio;

  return { text, style, x, y, width, height, scale, padding };
};

const renderDynamicText = (dynamicText) => {
  const { canvas } = ctx;
  const { text, style, x, y, width, height, scale, padding } = dynamicText;

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  Object.assign(ctx, style);
  ctx.textBaseline = 'middle';

  const hoffset = height / 2;
  const { letterSpacing } = style;

  if (letterSpacing) {
    let offset = padding / 2;

    for (let i = 0, n = text.length; i < n; i++) {
      const letter = text[i];
      ctx.fillText(letter, x + offset + i * letterSpacing, y + hoffset);
      offset += ctx.measureText(letter).width;
    }
  } else {
    ctx.fillText(text, x + padding / 2, y + hoffset);
  }
};

export const createDynamicText = (gl, text, style = {}) => {
  const dynamicText = buildDynamicText(text, style);
  const { x, y, width, height, scale } = dynamicText;

  renderDynamicText(dynamicText);

  return {
    ...dynamicText,
    texture: twgl.createTexture(gl, {
      src: ctx.getImageData(x, y, width * scale, height * scale),
    }),
  };
};
