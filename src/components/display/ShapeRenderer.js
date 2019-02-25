import * as twgl from 'twgl.js';
import { m4 } from 'twgl.js';

import { nullCheck } from '@/helpers/functions';
import { applyVertexColors } from '@/helpers/gl';

import vertexShader from '@/shaders/shape.vert';
import fragmentShader from '@/shaders/shape.frag';

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

  setViewMatrix(viewMatrix) {
    this.uniforms.u_viewMatrix = viewMatrix;
  }

  triangle(x1, y1, x2, y2, x3, y3, fill = WHITE, alpha = 1) {
    const {
      arrays: { position, color },
    } = this;

    if (alpha <= 0) return;

    // position
    position.push(x1, y1, x2, y1, x2, y2);

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
    const {
      arrays: { position, color },
    } = this;

    if (alpha <= 0 || precision < 3) return;

    const c = [fill[0], fill[1], fill[2], fill[3] * alpha];

    const { sin, cos } = Math;
    const step = (Math.PI * 2) / precision;

    // cache previous point on circle
    let angle = 0;
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

    const angle = Math.atan2(y1 - y2, x1 - x2);
    const radius = stroke * 0.5;

    const sin = Math.sin(angle + Math.PI * 0.5) * radius;
    const cos = Math.cos(angle + Math.PI * 0.5) * radius;

    // position
    position.push(x1 - cos, y1 - sin, x1 + cos, y1 + sin, x2 + cos, y2 + sin);
    position.push(x1 - cos, y1 - sin, x2 + cos, y2 + sin, x2 - cos, y2 - sin);

    // color
    applyVertexColors(color, 6, fill, alpha);

    this.batchSize += 2;
  }

  hollowArc(
    x,
    y,
    radius,
    startAngle = 0,
    endAngle = Math.PI * 2,
    stroke = 1,
    fill = WHITE,
    alpha = 1,
    precision = 64
  ) {
    if (precision < 0 || alpha <= 0) return;

    const c = [fill[0], fill[1], fill[2], fill[3] * alpha];

    const { sin, cos } = Math;
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

  hollowRect(x1, y1, x2, y2, stroke = 1, fill = WHITE, alpha = 1) {
    if (alpha <= 0) return;

    const halfStroke = stroke * 0.5;
    // top
    this.line(x1 - halfStroke, y1, x2 + halfStroke, y1, stroke, fill, alpha);
    // bottom
    this.line(x1 - halfStroke, y2, x2 + halfStroke, y2, stroke, fill, alpha);
    // left
    this.line(x1, y1, x1, y2, stroke, fill, alpha);
    // right
    this.line(x2, y1, x2, y2, stroke, fill, alpha);
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
    this.batchSize = 0;
    this.arrays.position.reset();
    this.arrays.color.reset();
  }
}