import Ticker from './Ticker';
import GameState from './GameState';
import Loader from './Loader';

import { Renderer } from '@/components/display';
import { InputManager } from '@/components/input';
import { SoundManager } from '@/components/audio';

export default class Game {
  constructor(canvas, options = {}) {
    if (!canvas) {
      canvas = document.createElement('canvas');

      Object.assign(canvas.style, {
        width: '100%',
        height: '100%',
      });

      document.body.appendChild(canvas);
    }

    this.view = canvas;

    this.loop = new Ticker();
    this.renderer = new Renderer(this.view);
    this.state = new GameState({ game: this });
    this.input = new InputManager(this);
    this.sound = new SoundManager(this);
    this.loader = new Loader(this);

    if (!this.renderer.isReady()) {
      const error = document.getElementById('error');
      error.innerText = 'WebGL is not supported by your browser.';
      return;
    }

    this.renderer.onResize = this.render;

    this.state.trigger('init');

    this.create();
  }

  create = () => {
    this.renderer.create();
    this.input.create();

    this.state.trigger('create', this);

    this.start();
  };

  destroy = () => {
    this.state.trigger('destroy');

    const { view } = this;
    view.parentElement.removeChild(view);

    this.loop.stop();
    this.renderer.destroy();
    this.input.destroy();

    this.view = null;
    this.renderer = null;
    this.state = null;
    this.input = null;
    this.loader = null;
  };

  start = () => {
    this.loop.start((dt) => {
      this.update(dt);
      this.render();
    });
  };

  stop = () => {
    this.loop.stop();
  };

  update = (dt) => {
    this.state.trigger('update', dt);
  };

  render = () => {
    const { renderer } = this;
    renderer.preRender();
    this.state.trigger('render', renderer);
    this.input.update();
  };

  getSize() {
    const { width, height } = this.renderer;
    return { width, height };
  }

  getFPS() {
    return Math.round(this.loop.averageFPS);
  }

  setBackgroundColor(...params) {
    this.renderer.setBackgroundColor(...params);
  }
}
