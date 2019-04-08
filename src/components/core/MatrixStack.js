import { m4 } from 'twgl.js';

export default class MatrixStack {
  constructor() {
    this.stack = [];
    this.restore();
  }

  restore() {
    const { stack } = this;

    stack.pop();
    // Never let the stack be totally empty
    if (stack.length < 1) {
      stack[0] = m4.identity();
    }
  }

  save() {
    this.stack.push(this.getCurrentMatrix());
  }

  // Gets a copy of the current matrix (top of the stack)
  getCurrentMatrix() {
    const { stack } = this;
    return stack[stack.length - 1];
  }

  // Lets us set the current matrix
  setCurrentMatrix(m) {
    const { stack } = this;
    return (stack[stack.length - 1] = m);
  }

  // Translates the current matrix
  translate(x, y, z = 0) {
    const m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.translate(m, [x, y, z]));
  }

  // Rotates the current matrix around Z
  rotateZ(angleInRadians) {
    const m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.rotateZ(m, angleInRadians));
  }

  // Scales the current matrix
  scale(x, y, z = 1) {
    const m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.scale(m, [x, y, z]));
  }

  rotate2D(x, y, radians) {
    this.translate(x, y, 0);
    this.rotateZ(radians);
    this.translate(-x, -y, 0);
  }
}
