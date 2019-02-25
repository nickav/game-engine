import Key from './Key';

const MAX_UPDATE_ID = 65535;
const MAX_KEY_CODE = 255;

export default class KeyboardManager {
  constructor(game) {
    this.game = game;

    this.updateId = 1;
    this._string = '';
    this.lastKeyCode = 0;
    this.lastKey = '';

    // array of booleans
    this.isDown = new Uint8Array(MAX_KEY_CODE);
    // arrays of integers
    this.isPress = new Uint16Array(MAX_KEY_CODE);
    this.isRelease = new Uint16Array(MAX_KEY_CODE);

    // mobile
    this.input = null;
    this.events = [];
  }

  create() {
    // bind listeners
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  destroy() {
    // unbind listeners
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  update(dt) {
    const { updateId } = this;

    // handle wrap around
    if (updateId >= MAX_UPDATE_ID) {
      this.updateId = 1;
      this.isPress.fill(0);
      this.isRelease.fill(0);
    }

    this.updateId++;

    // handle virtual events
    if (this.events.length) {
      const { events } = this;

      for (let i = 0, n = events.length; i < n; i++) {
        events[i]();
      }

      events.length = 0;
    }
  }

  onKeyDown = (e) => {
    if (!this.capture(e)) {
      return;
    }

    // capture event
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    const keyCode = e.keyCode || e.which || 0;
    this.processKey(keyCode, e.repeat ? 'repeat' : 'press');

    this._string = this.processString(e, this._string);
    this.lastKeyCode = keyCode;
    this.lastKey = e.key;
  };

  onKeyUp = (e) => {
    const keyCode = e.keyCode || e.which || 0;
    this.processKey(keyCode, 'release');
    this.lastKeyCode = keyCode;
    this.lastKey = e.key;
  };

  processKey(keyCode, action) {
    const { updateId } = this;

    this.isDown[keyCode] = action === 'press' || action === 'repeat';
    this.isPress[keyCode] = action == 'press' ? updateId : 0;
    this.isRelease[keyCode] = action == 'release' ? updateId : 0;
  }

  down(keyCode) {
    if (keyCode === Key.ANY || keyCode === Key.NONE) {
      return this.checkMany(keyCode, this.isDown, (down) => !!down);
    }

    return !!this.isDown[keyCode];
  }

  press(keyCode) {
    const { updateId } = this;

    if (keyCode === Key.ANY || keyCode === Key.NONE) {
      return this.checkMany(
        keyCode,
        this.isPress,
        (pressId) => pressId >= updateId
      );
    }

    return this.isPress[keyCode] >= updateId;
  }

  release(keyCode) {
    const { updateId } = this;

    if (keyCode === Key.ANY || keyCode === Key.NONE) {
      return this.checkMany(
        keyCode,
        this.isRelease,
        (releaseId) => releaseId >= updateId
      );
    }

    return this.isRelease[keyCode] >= updateId;
  }

  processString(e, str) {
    const { key } = e;

    // process single keys, but ignore modifiers
    str += key.length === 1 ? key : '';

    // handle special keys:
    if (key === 'Enter') {
      str += '\n';
    } else if (key === 'Backspace') {
      str = e.metaKey || e.ctrlKey ? '' : str.substr(0, str.length - 1);
    }

    return str;
  }

  checkMany(keyCode, array, fn) {
    const any = array.some(fn);
    const inverted = keyCode === Key.NONE;
    return inverted ? !any : any;
  }

  isMeta = (e) => e.getModifierState('Meta') || e.getModifierState('OS');

  isCtrl = (e) => e.getModifierState('Control');

  isShift = (e) => e.getModifierState('Shfit');

  isAlt = (e) => e.getModifierState('Alt');

  capture = (e) => !e.metaKey;

  open() {
    if (!this.input) {
      const input = document.createElement('input');

      Object.assign(input, {
        tabindex: -1,
        autocapitalize: false,
        autocomplete: false,
        autocorrect: false,
        spellcheck: false,
      });

      Object.assign(input.style, {
        position: 'absolute',
        top: '-99999px',
        opacity: 0,
        zIndex: -1,
      });

      document.body.appendChild(input);
      this.input = input;
      this.input.addEventListener('input', this._handleVirtualInput);
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    }

    this.input.focus();
    document.body.addEventListener('click', this._open);
    document.body.addEventListener('touchstart', this._open);
  }

  close() {
    if (this.input) {
      document.body.removeEventListener('click', this._open);
      document.body.removeEventListener('touchstart', this._open);
      this.input.blur();
    }
  }

  _handleVirtualInput = (e) => {
    const { value } = e.target;
    const key = value.charAt(value.length - 1);
    const keyCode = key.charCodeAt(0) || 8;

    this.processKey(keyCode, 'press');
    this.events.push(() => this.processKey(keyCode, 'release'));

    this._string = value.toLowerCase();
    this.lastKeyCode = keyCode;
    this.lastKey = key;
  };

  _open = () => this.input.focus();

  get string() {
    return this._string;
  }

  set string(str) {
    if (this._string === str) return;

    this._string = str;

    if (this.input) {
      this.input.value = str;
    }
  }
}
