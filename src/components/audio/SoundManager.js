import { Howl, Howler } from 'howler';

import { stripExt } from '@/helpers/functions';

const simpleName = (path) => {
  const parts = path.split('/');
  return stripExt(parts[parts.length - 1]);
};

const DEFAULT_CONFIG = {};

export default class SoundManager {
  constructor(game, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };

    this.game = game;
    this.sounds = {};
  }

  create() {}

  update(dt) {}

  destroy() {
    this.game = null;
  }

  play(key) {
    const sound = this.get(key);
    return sound.play();
  }

  stop(key) {
    const sound = this.get(key);
    return sound.stop();
  }

  isPlaying(key) {
    const sound = this.get(key);
    return sound && sound.playing();
  }

  get(key) {
    if (!(key in this.sounds)) {
      return;
    }

    return this.sounds[key];
  }

  setVolume(volume) {
    Howler.volume(volume);
  }
}
