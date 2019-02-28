import ResourceLoader, { Resource } from 'resource-loader';
import * as twgl from 'twgl.js';

const textureLoaderMiddleware = gl => (res, next) => {
  if (res.data && res.type === Resource.TYPE.IMAGE) {
    res.texture = twgl.createTexture(gl, {
      mag: gl.NEAREST,
      min: gl.NEAREST,
      src: res.data,
    });
  }

  next();
};

export default class Loader extends ResourceLoader {
  constructor(game, baseUrl, concurrency) {
    super(baseUrl, concurrency);

    this.use(textureLoaderMiddleware(game.renderer.gl));
  }

  load(cb) {
    super.load((_, res) => cb(res));
  }

  get percent() {
    return this.progress / 100;
  }
}
