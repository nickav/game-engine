import * as twgl from 'twgl.js';
import { m4 } from 'twgl.js';

import { nullCheck } from '@/helpers/functions';
import { applyVertexColors } from '@/helpers/gl';

import vertexShader from '@/shaders/shape.vert';
import fragmentShader from '@/shaders/shape.frag';

const { sin, cos, atan2 } = Math;
const TWO_PI = Math.PI * 2;
const PI_2 = Math.PI * 0.5;
const WHITE = [1, 1, 1, 1];

export default class ShapeRenderer {
  constructor(gl) {
    this.gl = gl;
    this.debug = process.env.NODE_ENV === 'development';

    // 3 vertices each triangle
    this.MAX_SHAPES = ~~(65536 / 3);

    const numVertices = 3 * this.MAX_SHAPES;

    this.arrays = {
      position: twgl.primitives.createAugmentedTypedArray(
        2,
        numVertices,
        Float32Array
      ),
      color: twgl.primitives.createAugmentedTypedArray(
        4,
        numVertices,
        Float32Array
      ),
    };

    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, this.arrays);

    this.programInfo = twgl.createProgramInfo(gl, [
      vertexShader,
      fragmentShader,
    ]);

    this.batchSize = 0;

    this.uniforms = {
      u_viewMatrix: m4.identity(),
    };
  }

  destroy() {
    const { gl, programInfo, bufferInfo } = this;
    gl.deleteProgram(programInfo.program);
    this.programInfo = null;

    const { attribs } = bufferInfo;
    gl.deleteBuffer(attribs.position.buffer);
    gl.deleteBuffer(attribs.color.buffer);
    this.bufferInfo = null;
    this.arrays = null;
  }

  setViewMatrix(viewMatrix) {
    this.uniforms.u_viewMatrix = viewMatrix;
  }

  triangle(x1, y1, x2, y2, x3, y3, fill = WHITE, alpha = 1) {
    const {
      arrays: { position, color },
    } = this;

    if (alpha <= 0) return;

    // position
    position.push(x1, y1, x2, y2, x3, y3);

    // color
    applyVertexColors(color, 3, fill, alpha);

    this.batchSize++;
  }

  rectangle(x1, y1, x2, y2, fill = WHITE, alpha = 1) {
    const {
      arrays: { position, color },
    } = this;

    if (alpha <= 0) return;

    // position
    position.push(x1, y1, x2, y1, x2, y2);
    position.push(x1, y1, x2, y2, x1, y2);

    // color
    applyVertexColors(color, 6, fill, alpha, 0, 1, 2, 0, 2, 3);

    this.batchSize += 2;
  }

  circle(x, y, radius, fill = WHITE, alpha = 1, precision = 64) {
    this.arc(x, y, radius, 0, TWO_PI, fill, alpha, precision);
  }

  arc(
    x,
    y,
    radius,
    startAngle = 0,
    endAngle = TWO_PI,
    fill = WHITE,
    alpha = 1,
    precision = 64
  ) {
    const {
      arrays: { position, color },
    } = this;

    if (alpha <= 0 || precision < 3) return;

    const c = [fill[0], fill[1], fill[2], fill[3] * alpha];

    const step = (endAngle - startAngle) / precision;

    // cache previous point on circle
    let angle = startAngle;
    let x1 = cos(angle) * radius;
    let y1 = sin(angle) * radius;

    for (let i = 0; i < precision; i++) {
      angle += step;

      const x2 = cos(angle) * radius;
      const y2 = sin(angle) * radius;

      // position
      position.push(x, y, x + x1, y + y1, x + x2, y + y2);

      // color
      color.push(c);
      color.push(c);
      color.push(c);

      x1 = x2;
      y1 = y2;
    }

    this.batchSize += precision;
  }

  line(x1, y1, x2, y2, stroke = 1, fill = WHITE, alpha = 1) {
    const {
      arrays: { position, color },
    } = this;

    if (alpha <= 0) return;

    const angle = atan2(y1 - y2, x1 - x2);
    const radius = stroke * 0.5;

    const s = sin(angle + PI_2) * radius;
    const c = cos(angle + PI_2) * radius;

    // position
    position.push(x1 - c, y1 - s, x1 + c, y1 + s, x2 + c, y2 + s);
    position.push(x1 - c, y1 - s, x2 + c, y2 + s, x2 - c, y2 - s);

    // color
    applyVertexColors(color, 6, fill, alpha);

    this.batchSize += 2;
  }

  trapezoid(x1, y1, x2, y2, x3, y3, x4, y4, fill = WHITE, alpha = 1) {
    const {
      arrays: { position, color },
    } = this;

    if (alpha <= 0) return;

    this.triangle(x1, y1, x2, y2, x4, y4, fill, alpha);
    this.triangle(x1, y1, x4, y4, x3, y3, fill, alpha);
  }

  hollowArc(
    x,
    y,
    radius,
    startAngle = 0,
    endAngle = TWO_PI,
    stroke = 1,
    fill = WHITE,
    alpha = 1,
    precision = 64
  ) {
    if (precision < 0 || alpha <= 0) return;

    const {
      arrays: { position, color },
    } = this;

    const c = [fill[0], fill[1], fill[2], fill[3] * alpha];

    const step = (endAngle - startAngle) / precision;

    // cache previous point on circle
    let angle = startAngle;
    let x1 = cos(angle) * radius;
    let y1 = sin(angle) * radius;

    for (let i = 0; i < precision; i++) {
      angle += step;

      const x2 = cos(angle) * radius;
      const y2 = sin(angle) * radius;

      this.line(x + x1, y + y1, x + x2, y + y2, stroke, fill, alpha);

      x1 = x2;
      y1 = y2;
    }
  }

  hollowLineArc(
    x,
    y,
    radius,
    startAngle = 0,
    endAngle = TWO_PI,
    stroke = 1,
    fill = WHITE,
    alpha = 1,
    precision = 64
  ) {
    if (precision < 0 || alpha <= 0) return;

    const c = [fill[0], fill[1], fill[2], fill[3] * alpha];

    const step = (endAngle - startAngle) / precision;

    // cache previous point on circle
    let angle = startAngle;
    let x1 = cos(angle) * radius;
    let y1 = sin(angle) * radius;

    for (let i = 0; i < precision; i++) {
      angle += step;

      const x2 = cos(angle) * radius;
      const y2 = sin(angle) * radius;

      this.line(x + x1, y + y1, x + x2, y + y2, stroke, fill, alpha);

      x1 = x2;
      y1 = y2;
    }
  }

  hollowRect(x1, y1, x2, y2, stroke = 1, fill = WHITE, alpha = 1, style = 0) {
    if (alpha <= 0) return;

    //rectangle(x1, y1, x2, y2, fill = WHITE, alpha = 1) {
    if (style === 1) {
      // outset
      this.rectangle(x1 - stroke, y1 - stroke, x2 + stroke, y1, fill, alpha); // top
      this.rectangle(x1 - stroke, y2, x2 + stroke, y2 + stroke, fill, alpha); // bottom
      this.rectangle(x1 - stroke, y1, x1, y2, fill, alpha); // left
      this.rectangle(x2, y1, x2 + stroke, y2, fill, alpha); // right
    } else if (style === 2) {
      // middle
      const hs = stroke * 0.5;
      this.rectangle(x1 - hs, y1 - hs, x2 + hs, y1 + hs, fill, alpha); // top
      this.rectangle(x1 - hs, y2 - hs, x2 + hs, y2 + hs, fill, alpha); // bottom
      this.rectangle(x1 - hs, y1, x1 + hs, y2, fill, alpha); // left
      this.rectangle(x2 - hs, y1, x2 + hs, y2, fill, alpha); // right
    } else {
      // inset (default)
      this.rectangle(x1, y1, x2, y1 + stroke, fill, alpha); // top
      this.rectangle(x1, y2 - stroke, x2, y2, fill, alpha); // bottom
      this.rectangle(x1, y1 + stroke, x1 + stroke, y2 - stroke, fill, alpha); // left
      this.rectangle(x2 - stroke, y1 + stroke, x2, y2 - stroke, fill, alpha); // right
    }
  }

  render() {
    const { arrays, batchSize, gl, programInfo, bufferInfo, uniforms } = this;

    if (batchSize === 0) return;

    gl.useProgram(programInfo.program);

    // bind arrays
    const { attribs } = bufferInfo;
    twgl.setAttribInfoBufferFromArray(gl, attribs.position, arrays.position);
    twgl.setAttribInfoBufferFromArray(gl, attribs.color, arrays.color);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    // 3 vertices in each triangle
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, batchSize * 3);
  }

  flush() {
    this.render();
    this.clear();
  }

  clear() {
    if (this.batchSize === 0) return;
    this.batchSize = 0;
    this.arrays.position.reset();
    this.arrays.color.reset();
  }
}
