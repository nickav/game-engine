import { removeItems } from '@/helpers/functions';

export default class UpdateList {
  constructor(items = []) {
    this.items = items;
    this._graveyard = [];
    this._heaven = [];
  }

  preUpdate() {
    const heaven = this._heaven;
    let child = null;

    for (var i = 0, n = heaven.length; i < n; i++) {
      child = heaven[i];
      items.push(child);
      this.onAddChild(child);
    }

    heaven.length = 0;
  }

  update(dt) {
    this.preUpdate();
    this.updateItems(dt);
    this.postUpdate();
  }

  updateItems(dt) {
    const items = this.items;

    for (let i = 0, n = items.length; i < n; i++) {
      items[i].update(dt);
    }
  }

  postUpdate() {
    const graveyard = this._graveyard;
    let child = null;

    for (let i = 0, n = graveyard.length; i < n; i++) {
      child = graveyard[i];

      const index = items.indexOf(child);
      if (index >= 0) {
        removeItems(items, index, 1);
        this.onRemoveChild(child);
      }
    }

    graveyard.length = 0;
  }

  destroy() {
    this.preUpdate();

    const items = this.items;
    for (let i = 0, n = items.length; i < n; i++) {
      this.removeChild(items[i]);
      this.onRemoveChild(items[i]);
    }

    items.length = 0;
    this._graveyard.length = 0;
    this._heaven.length = 0;
  }

  getItems() {
    return this.items;
  }

  addChild(child) {
    this._heaven.push(child);
    this.beforeAddChild(child);
  }

  removeChild(child) {
    const graveyard = this._graveyard;

    if (graveyard.indexOf(child) < 0) {
      graveyard.push(child);
      beforeRemoveChild(child);
    }
  }

  onAddChild(child) {}

  beforeAddChild(child) {}

  onRemoveChild(child) {}

  beforeRemoveChild(child) {}

  trigger(eventName, ...args) {
    items
      .filter(item => typeof item[eventName] === 'function')
      .forEach(item => item[eventName](...args));
  }

  triggerMap(eventName, ...args) {
    return items
      .filter(item => typeof item[eventName] === 'function')
      .map(item => item[eventName](...args));
  }

  get length() {
    return this.items.length;
  }
}
