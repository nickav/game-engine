export default class Pointer {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.index = 0;
    this.isDown = false;
    this.wasDown = false;
    this.isTouch = false;
  }

  down() {
    return this.isDown;
  }

  press() {
    return !this.wasDown && this.isDown;
  }

  release() {
    return this.wasDown && !this.isDown;
  }

  reset() {
    this.isDown = false;
    this.wasDown = false;
  }

  getBounds() {
    const { x, y } = this;
    return { x, y, width: 1, height: 1 };
  }
}
