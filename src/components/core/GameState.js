import { assert } from '@/helpers/functions';

export default class GameState {
  constructor(props = {}) {
    this.stack = [];
    this.length = 0;
    this.props = props;

    this._current = null;
    this._prev = null;
  }

  set(next, ...rest) {
    this.trigger('destroy');

    this.length = Math.max(1, this.length);
    this.stack[this.length - 1] = Object.assign(next, this.props);
    this._updatePointers();

    this.trigger('create');
  }

  push(next, ...rest) {
    this.trigger('pause');

    this.stack[this.length] = Object.assign(next, this.props);
    this.length++;
    this._updatePointers();

    this.trigger('create');
  }

  pop(...rest) {
    if (this.length === 0) return;

    this.trigger('destroy');

    this.length--;
    const prev = this.stack[this.length];
    this.stack[this.length] = undefined;
    this._updatePointers();

    this.trigger('resume');
    return prev;
  }

  replace(next, ...rest) {
    this.clear();
    this.set(next, ...rest);
  }

  clear() {
    while (this.length > 0) {
      this.pop();
    }
  }

  trigger(method, ...rest) {
    const curr = this._current;

    if (curr && typeof curr[method] === 'function') {
      return curr[method](...rest);
    }
  }

  _updatePointers() {
    this._current = this.stack[this.length - 1];
    this._prev = this.stack[this.length - 2];
  }

  get current() {
    return this._current;
  }

  getCurrent() {
    return this._current;
  }

  get prev() {
    return this._prev;
  }

  getPrevious() {
    return this._prev;
  }
}
