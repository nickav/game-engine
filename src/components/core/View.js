import { m4 } from 'twgl.js';
import { transformPoint } from '@/helpers/functions';

export default class View {
  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
    this.displayWidth = width;
    this.displayHeight = height;
    this.scale = 1;
    this.viewMatrix = m4.identity();
  }

  transform(point) {
    return transformPoint(this.viewMatrix, point);
  }

  untransform(point) {
    const vm = this.viewMatrix;
    m4.inverse(vm, vm);
    return transformPoint(vm, point);
  }

  getViewMatrix() {
    const viewMatrix = m4.identity();
    m4.ortho(0, this.displayWidth, this.displayHeight, 0, -1, 1, viewMatrix);
    m4.scale(viewMatrix, [this.scale, this.scale, 1], viewMatrix);
    return viewMatrix;
  }

  getSize() {
    const { width, height } = this;
    return { width, height };
  }

  getDisplaySize() {
    const { displayWidth: width, displayHeight: height } = this;
    return { width, height };
  }

  getBounds() {
    const { width, height } = this;
    return { x: 0, y: 0, width, height };
  }

  setSize(width, height, scale = 1) {
    // props
    this.displayWidth = width;
    this.displayHeight = height;
    this.scale = scale;

    // computed props
    this.width = this.displayWidth / this.scale;
    this.height = this.displayHeight / this.scale;
    this.viewMatrix = this.getViewMatrix();
  }
}
