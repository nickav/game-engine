import PointerManager from './PointerManager';
import KeyboardManager from './KeyboardManager';

const DEFAULT_CONFIG = {
  pointer: true,
  keyboard: true,
  element: window,
};

export default class InputManager {
  constructor(game, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };

    this.game = game;
    this.plugins = [];

    if (config.pointer) {
      const pointerManager = new PointerManager(game, config.pointer);
      this.pointer = pointerManager.pointer;
      this.touches = pointerManager.touches;
      this.mouse = pointerManager.mouse;
      this.plugins.push(pointerManager);
    }

    if (config.keyboard) {
      const keyboardManager = new KeyboardManager(game, config.keyboard);
      this.keyboard = keyboardManager;
      this.plugins.push(keyboardManager);
    }
  }

  create() {
    this.plugins.forEach((plugin) => plugin.create());
  }

  destroy() {
    this.plugins.forEach((plugin) => plugin.destroy());
    this.plugins = null;
    this.game = null;
  }

  update(dt) {
    const { plugins } = this;
    for (let i = 0, n = plugins.length; i < n; i++) {
      plugins[i].update(dt);
    }
  }
}
