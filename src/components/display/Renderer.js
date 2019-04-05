import * as twgl from 'twgl.js';

import BlendMode from '@/components/core/BlendMode';
import View from '@/components/core/View';
import SpriteRenderer from './SpriteRenderer';
import ShapeRenderer from './ShapeRenderer';
import FontRenderer from './FontRenderer';

const isDev = process.env.NODE_ENV === 'development';
twgl.setDefaultTextureColor([0.0, 0.0, 0.0, isDev ? 1.0 : 0.0]);

export default class Renderer extends View {
  constructor(canvas) {
    super();

    const gl = twgl.getWebGLContext(canvas);

    this.gl = gl;
    this.view = canvas;
    this.backgroundColor = [0, 0, 0, 1];
    this.onResize = null;
    this.scale = window.devicePixelRatio || 1;

    if (!gl) {
      console.error(
        'Unable to initialize WebGL. Your browser or machine may not support it.'
      );
      return;
    }

    this.spriteBatch = new SpriteRenderer(gl);
    this.shapeBatch = new ShapeRenderer(gl);
    this.fontBatch = new FontRenderer(gl);
  }

  create() {
    const { gl } = this;

    this.blendModes = {
      [BlendMode.NORMAL]: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
      [BlendMode.ADD]: [gl.SRC_ALPHA, gl.ONE],
    };

    this.resize();
  }

  preRender() {
    const { gl } = this;

    // make we have a gl context
    if (!gl) return;

    this.resize();

    // set background color
    const { backgroundColor: bg } = this;
    gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // set default blend mode
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // update view matricies
    const viewMatrix = this.getViewMatrix();
    this.spriteBatch.setViewMatrix(viewMatrix);
    this.shapeBatch.setViewMatrix(viewMatrix);
    this.fontBatch.setViewMatrix(viewMatrix);
  }

  destroy() {
    this.spriteBatch.destroy();
    this.shapeBatch.destroy();
    this.fontBatch.destroy();

    this.view = null;
    this.gl = null;
    this.spriteBatch = null;
    this.shapeBatch = null;
    this.fontBatch = null;
  }

  setBackgroundColor(r, g, b, a = 1) {
    this.backgroundColor[0] = r;
    this.backgroundColor[1] = g;
    this.backgroundColor[2] = b;
    this.backgroundColor[3] = a;
  }

  setBlendMode(blendMode) {
    const { blendModes } = this;
    const args = blendModes[blendMode] || blendModes[BlendMode.NORMAL];
    this.gl.blendFunc(...args);
  }

  isReady() {
    return !!this.gl;
  }

  resize = () => {
    const { gl, view } = this;

    // update canvas view
    const scale = this.scale;

    if (twgl.resizeCanvasToDisplaySize(view, scale)) {
      gl.viewport(0, 0, view.width, view.height);
      this.setSize(view.width, view.height, scale);

      this.onResize && this.onResize();
    }
  };
}
