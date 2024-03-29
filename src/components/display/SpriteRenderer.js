import * as twgl from 'twgl.js';
import { m4 } from 'twgl.js';

import { nullCheck } from '@/helpers/functions';
import { applyVertexColors } from '@/helpers/gl';
import MatrixStack from '@/components/core/MatrixStack';

import vertexShader from '@/shaders/sprite.vert';
import fragmentShader from '@/shaders/sprite.frag';

const DEFAULT_UVS = [0, 0, 1, 1];

export default class SpriteRenderer {
  constructor(gl, options) {
    this.gl = gl;
    this.debug = process.env.NODE_ENV === 'development';

    this.scale = 1;
    this.view = new MatrixStack();

    // 4 vertices each sprite square
    this.MAX_SPRITES = ~~(65536 / 4);

    const numVertices = 4 * this.MAX_SPRITES;
    const numIndices = 6 * this.MAX_SPRITES;

    const indices = [];

    // prettier-ignore
    this.arrays = {
      position: twgl.primitives.createAugmentedTypedArray(2, numVertices, Float32Array),
      texcoord: twgl.primitives.createAugmentedTypedArray(2, numVertices, Float32Array),
      color: twgl.primitives.createAugmentedTypedArray(4, numVertices, Float32Array),
      indices: twgl.primitives.createAugmentedTypedArray(3, numIndices, Uint16Array),
    };

    // fill indicies buffer
    for (let i = 0; i < this.MAX_SPRITES; i++) {
      const offs = i * 4;
      this.arrays.indices.push([
        offs + 0,
        offs + 1,
        offs + 2,
        offs + 0,
        offs + 2,
        offs + 3,
      ]);
    }

    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, this.arrays);

    this.programInfo = twgl.createProgramInfo(gl, [
      vertexShader,
      fragmentShader,
    ]);

    this.batchSize = 0;
    this.uniforms = {
      u_viewMatrix: this.view.getCurrentMatrix(),
      u_texture: null,
    };
  }

  destroy() {
    const { gl, programInfo, bufferInfo } = this;
    gl.deleteProgram(programInfo.program);
    this.programInfo = null;

    const { attribs } = bufferInfo;
    gl.deleteBuffer(attribs.position.buffer);
    gl.deleteBuffer(attribs.texcoord.buffer);
    gl.deleteBuffer(attribs.color.buffer);
    this.bufferInfo = null;

    this.arrays = null;
  }

  setTexture(texture) {
    this.uniforms.u_texture = texture;
  }

  setViewMatrix(viewMatrix) {
    this.view.setCurrentMatrix(viewMatrix);
  }

  setProgram(programInfo) {
    this.programInfo = programInfo;
  }

  setScale(scale) {
    this.scale = scale;
  }

  add(sprite) {
    if (sprite.visible === false || sprite.alpha <= 0) {
      return;
    }

    if (this.batchSize >= this.MAX_SPRITES) {
      console.warn('SpriteRenderer: batch full, auto-flushing...');
      this.flush();
    }

    const {
      arrays: { position, texcoord, color },
    } = this;

    // position
    const s = typeof sprite.scale === 'number' ? sprite.scale : 1;
    const scalex = typeof sprite.scalex === 'number' ? sprite.scalex : s;
    const scaley = typeof sprite.scaley === 'number' ? sprite.scaley : s;

    const a = typeof sprite.anchor === 'number' ? sprite.anchor : 0;
    const anchorx = typeof sprite.anchorx === 'number' ? sprite.anchorx : a;
    const anchory = typeof sprite.anchory === 'number' ? sprite.anchory : a;

    const { x, y, width, height } = sprite;
    const { scale } = this;
    const sw = width * scalex * scale;
    const sh = height * scaley * scale;
    const xx = x - anchorx * sw;
    const yy = y - anchory * sh;
    const ww = xx + sw;
    const hh = yy + sh;
    position.push(xx, yy, ww, yy, ww, hh, xx, hh);

    // texcoord
    const uvs = sprite.uvs || DEFAULT_UVS;
    let v00 = [uvs[0], uvs[1]];
    let v10 = [uvs[2], uvs[1]];
    let v11 = [uvs[2], uvs[3]];
    let v01 = [uvs[0], uvs[3]];

    if (sprite.flipX) {
      let temp = v00;
      v00 = v10;
      v10 = temp;

      temp = v01;
      v01 = v11;
      v11 = temp;
    }

    if (sprite.flipY) {
      let temp = v00;
      v00 = v01;
      v01 = temp;

      temp = v10;
      v10 = v11;
      v11 = temp;
    }

    texcoord.push(v00);
    texcoord.push(v10);
    texcoord.push(v11);
    texcoord.push(v01);

    // color
    applyVertexColors(color, 4, sprite.color, sprite.alpha);

    this.batchSize++;

    if (this.debug) {
      const offset = this.batchSize - 1;

      let error = false;
      error |= nullCheck(color, offset * 16, 16, 'color');
      error |= nullCheck(texcoord, offset * 8, 8, 'texcoord');
      error |= nullCheck(position, offset * 8, 8, 'position');

      if (error) {
        console.error('Check sprite for non-numeric values:', sprite);
        throw new Error('SpriteRenderer: failed to add sprite to batch.');
      }
    }
  }

  render() {
    const {
      arrays,
      batchSize,
      gl,
      programInfo,
      bufferInfo,
      uniforms,
      view,
    } = this;

    if (batchSize === 0 || !uniforms.u_texture) return;

    // update uniforms
    uniforms.u_viewMatrix = view.getCurrentMatrix();

    gl.useProgram(programInfo.program);

    // bind arrays
    const { attribs } = bufferInfo;
    twgl.setAttribInfoBufferFromArray(gl, attribs.position, arrays.position);
    twgl.setAttribInfoBufferFromArray(gl, attribs.texcoord, arrays.texcoord);
    twgl.setAttribInfoBufferFromArray(gl, attribs.color, arrays.color);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    // 6 vertices in 2 triangles
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, batchSize * 6);
  }

  renderWithRotation(x, y, radians) {
    const { view } = this;

    view.save();
    view.rotate2D(x, y, radians);

    this.render();

    view.restore();
  }

  flush() {
    this.render();
    this.clear();
  }

  clear() {
    this.batchSize = 0;

    // reset arrays
    const { position, texcoord, color } = this.arrays;
    position.reset();
    texcoord.reset();
    color.reset();
  }

  getTexture() {
    return this.uniforms.u_texture;
  }
}
