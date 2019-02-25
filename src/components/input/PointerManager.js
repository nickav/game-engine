import Pointer from './Pointer';

export default class PointerManager {
  constructor(game) {
    this.game = game;

    this.pointer = new Pointer();
    this.mouse = this.pointer;
    this.touches = [];

    this.isTouchSupported = 'ontouchstart' in window;
    this.offset = { x: 0, y: 0 };
  }

  create() {
    const { game } = this;

    const rect = game.view.getBoundingClientRect();
    this.offset = { x: rect.left || 0, y: rect.top || 0 };

    // bind listeners
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    window.addEventListener('touchstart', this.onMouseDown);
    window.addEventListener('touchmove', this.onMouseMove);
    window.addEventListener('touchend', this.onMouseUp);
    window.addEventListener('touchcancel', this.onMouseUp);

    window.addEventListener('wheel', this._preventDefault);

    game.view.addEventListener('contextmenu', this._preventDefault);

    // start pointer in center of screen
    const { width, height } = game.getSize();
    this.pointer.x = width * 0.5;
    this.pointer.y = height * 0.5;
  }

  destroy() {
    // unbind listeners
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    window.removeEventListener('touchstart', this.onMouseDown);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('touchend', this.onMouseUp);
    window.removeEventListener('touchcancel', this.onMouseUp);

    window.removeEventListener('wheel', this._preventDefault);
  }

  update(dt) {
    this.pointer.wasDown = this.pointer.isDown;
  }

  onMouseDown = (e) => {
    this.pointer.isDown = true;
    this._processEvent(e);
  };

  onMouseMove = (e) => {
    e.preventDefault();
    this._processEvent(e);
  };

  onMouseUp = (e) => {
    e.preventDefault();
    this.pointer.isDown = false;
    this._processEvent(e);
  };

  _processEvent(event) {
    const { touches } = event;

    if (touches) {
      this.touches.length = touches.length;

      for (let i = 0, n = touches.length; i < n; i++) {
        const { pageX: x, pageY: y } = touches[i];

        let pointer = this.touches[i];

        if (!pointer) {
          pointer = new Pointer();
          this.touches[i] = pointer;
        }

        const { offset } = this;
        pointer.x = x - offset.x;
        pointer.y = y - offset.y;
        pointer.isTouch = true;
        pointer.index = i;
      }
    } else {
      // emulate touch event with mouse
      if (this.pointer.isDown && !this.isTouchSupported) {
        this.touches[0] = this.pointer;
      } else {
        this.touches.length = 0;
      }
    }

    if (this.isTouchSupported && this.touches.length) {
      this.pointer.x = this.touches[0].x;
      this.pointer.y = this.touches[0].y;
    } else {
      const { pageX, pageY } = event;
      const { offset } = this;
      this.pointer.x = pageX - offset.x;
      this.pointer.y = pageY - offset.y;
    }
  }

  _preventDefault = (event) => event.preventDefault();
}
