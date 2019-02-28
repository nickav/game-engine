import * as twgl from 'twgl.js';
import { m4 } from 'twgl.js';

import { createDynamicText, getFontWidth } from '@/helpers';

import SpriteRenderer from './SpriteRenderer';

export default class FontRenderer {
  constructor(gl) {
    this.gl = gl;
    this.spriteRenderer = new SpriteRenderer(gl);
    this.cache = {};
    this.batch = [];
  }

  destroy() {
    this.cache = null;
    this.batch = null;
    this.spriteRenderer.destroy();
    this.spriteRenderer = null;
  }

  setViewMatrix(viewMatrix) {
    this.spriteRenderer.setViewMatrix(viewMatrix);
  }

  add(font) {
    const dynamicText = this.getText(font);

    if (!dynamicText) {
      return;
    }

    const key = this.getCacheKey(font);
    this.batch.push({ ...dynamicText, ...font, key });
  }

  addCropWidth(font, width) {
    const text = this.getText(font);
    const p = (width + text.padding / 2) / text.width;
    const uvs = [0, 0, p, 1];
    this.add({ ...font, width: text.width * p, uvs });
  }

  render() {
    const { batch, spriteRenderer } = this;

    for (let i = 0, n = batch.length; i < n; i++) {
      const font = batch[i];
      spriteRenderer.setTexture(font.texture);
      spriteRenderer.add(font);
      spriteRenderer.flush();
    }
  }

  flush() {
    this.render();
    this.clear();
  }

  clear() {
    this.spriteRenderer.clear();
    this.batch.length = 0;
  }

  clearCache() {
    this.cache = {};
  }

  getText(font) {
    if (
      typeof font.text === 'undefined' ||
      (typeof font.text === 'string' && font.text.length === 0)
    ) {
      return;
    }

    const key = this.getCacheKey(font);

    // make sure we have the texture loaded
    if (!this.cache[key]) {
      const style =
        typeof font.style === 'string' ? { font: font.style } : font.style;

      this.cache[key] = createDynamicText(this.gl, font.text, style);
    }

    return this.cache[key];
  }

  getCacheKey(font) {
    const { text, style } = font;
    return JSON.stringify({ text, style });
  }
}
