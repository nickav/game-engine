import * as twgl from 'twgl.js';

import { parseTextureAtlas } from '@/helpers';

export default class Loader {
  loadSprites = (params, json) => {
    if (typeof params === 'string') {
      params = { src: params };
    }

    const { gl } = this;

    const defaultParams = {
      mag: gl.NEAREST,
      min: gl.NEAREST,
    };

    const atlas = json ? parseTextureAtlas(json) : null;

    return this.createTexture({ ...defaultParams, ...params }).then((result) => {
      return [result, atlas];
    });
  };

  createTexture = (params) => {
    const { gl } = this;

    return new Promise((res, rej) =>
      twgl.createTexture(this.gl, params, (err, texture, image) => {
        if (err) return rej(err);
        res({ texture, image, params });
      })
    );
  };

  loadSounds = (sounds = []) =>  {
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
