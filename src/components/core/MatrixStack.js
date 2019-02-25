import { m4 } from 'twgl.js';

export default class MatrixStack {
  constructor() {
    this.stack = [];
    this.restore();
  }

  restore() {
    this.stack.pop();
    // Never let the stack be totally empty
    if (this.stack.length < 1) {
      this.stack[0] = m4.identity();
    }
  }

  save() {
    this.stack.push(this.getCurrentMatrix());
  }

  // Gets a copy of the current matrix (top of the stack)
  getCurrentMatrix() {
    return this.stack[this.stack.length - 1].slice();
  }

  // Lets us set the current matrix
  setCurrentMatrix(m) {
    return (this.stack[this.stack.length - 1] = m);
  }

  // Translates the current matrix
  translate(x, y, z = 0) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.translate(m, [x, y, z]));
  }

  // Rotates the current matrix around Z
  rotateZ(angleInRadians) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.zRotate(m, angleInRadians));
  }

  // Scales the current matrix
  scale(x, y, z = 1) {
    var m = this.getCurrentMatrix();
    this.setCurrentMatrix(m4.scale(m, [x, y, z]));
  }
}
