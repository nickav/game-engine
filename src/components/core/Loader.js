import * as twgl from 'twgl.js';

import { parseTextureAtlas } from '@/helpers';

export default class Loader {
  constructor(game) {
    this.game = game;
    this.gl = game.renderer.gl;
  }

  loadSprite = (src, params = {}) => {
    const { gl } = this;

    const defaultParams = {
      mag: gl.NEAREST,
      min: gl.NEAREST,
    };

    return this.createTexture({ ...defaultParams, ...params, src });
  };

  loadAtlas = (json) => parseTextureAtlas(json);

  createTexture = (params) => {
    const { gl } = this;

    return new Promise((res, rej) =>
      twgl.createTexture(gl, params, (err, texture, image) => {
        if (err) return rej(err);
        res({ texture, image, params });
      })
    );
  };

  loadSounds = (sounds = []) => {
    return new Promise((res) => {
      const total = sounds.length;
      let finished = 0;

      const onLoadCallback = () => {
        if (++finished >= total) {
          res();
        }
      };

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
  };
}
