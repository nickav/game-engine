import { assert } from '@/helpers/functions';

export default class GameState {
  constructor(props = {}) {
    this.stack = [];
    this.length = 0;
    this.props = props;
  }

  set(next, ...rest) {
    this.trigger('destroy');

    this.length = Math.max(1, this.length);
    this.stack[this.length - 1] = Object.assign(next, this.props);

    this.trigger('create');
  }

  push(next, ...rest) {
    this.trigger('pause');

    this.stack[this.length] = Object.assign(next, this.props);
    this.length++;

    this.trigger('create');
  }

  pop(...rest) {
    if (this.length === 0) return;

    this.trigger('destroy');

    this.length--;
    const prev = this.stack[this.length];
    this.stack[this.length] = undefined;

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
    const curr = this.getCurrent();

    if (curr && typeof curr[method] === 'function') {
      return curr[method](...rest);
    }
  }

  get current() {
    return this.stack[this.length - 1];
  }

  getCurrent() {
    return this.stack[this.length - 1];
  }

  get prev() {
    return this.stack[this.length - 2];
  }

  getPrevious() {
    return this.stack[this.length - 2];
  }
}
