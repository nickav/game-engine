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

  load(sounds = []) {
    return new Promise((res) => {
      const total = sounds.length;
      let finished = 0;

      const onLoadCallback = () => {
        if (++finished >= total) {
          res();
        }
      }

      sounds.map((sound) => {
        const src = typeof sound === 'string' ? sound : sound.src;

        const howl = new Howl({
          ...(typeof sound === 'string'
            ? {
                src: [sound],
              }
            : sound),
        });

        this.sounds[simpleName(src)] = howl;

        howl.on('load', onLoadCallback);
        howl.on('loaderror', onLoadCallback);
      });
    });
  }
}
