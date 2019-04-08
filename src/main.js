import { m4, v3 } from 'twgl.js';

import { Game, Color, SpriteFontRenderer, parseTextureAtlas } from '@';
import _ from 'hibar';

import tinyunicodeAtlas from '@public/tinyunicode.json';
import spritesAtlas from '@public/sprites.json';
import sprites from '@public/sprites.png';

const canvas = document.getElementById('view');
const game = new Game(canvas);

window.game = game;

game.setBackgroundColor(0, 0, 0);

// loading state
game.state.set({
  create() {
    game.loader
      .add('sprites', sprites)
      .load((res) => game.state.set(new Main(res)));
  },
});

class Main {
  constructor(assets) {
    this.tex = assets.sprites.texture;

    this.spriteFontBatch = new SpriteFontRenderer(
      game.renderer.spriteBatch,
      spritesAtlas
    );

    this.spriteFontBatch.setFont('tinyunicode.png', tinyunicodeAtlas);

    this.sprites = parseTextureAtlas(spritesAtlas);
  }

  create() {
    const { spriteBatch } = this.game.renderer;
    spriteBatch.setTexture(this.tex);
  }

  render(re) {
    // draw rectangles
    const { shapeBatch } = re;
    const t = (this.game.loop.time / 1000) % 2;

    const rot = t * Math.PI * 2;

    shapeBatch.hollowRect(10, 10, 100, 100, 8, Color.make(0, 1, 0));
    shapeBatch.hollowRect(10, 10, 100, 100, 1, Color.WHITE);

    shapeBatch.circle(280, 100, 20);

    shapeBatch.arc(200, 200, 80, 0, Math.PI, Color.make(1, 0, 1), 1);

    shapeBatch.circle(120, 100, 10 + t * 10);
    shapeBatch.hollowArc(
      120,
      100,
      t * 40,
      rot,
      rot + Math.PI * 2,
      20,
      Color.WHITE,
      1,
      8
    );

    const w1 = 50;
    const w2 = 100;
    const h = 100;
    shapeBatch.trapezoid(
      200 - w1,
      220,
      200 + w1,
      220,
      200 - w2,
      220 + h,
      200 + w2,
      220 + h,
      Color.make(1, 0, 0)
    );

    shapeBatch.flush();

    // draw sprite font
    const { spriteBatch } = re;

    const x = 400;
    const y = 400;

    const sprite = {
      x: x + 100,
      y: y + 100,
      anchorx: 0.5,
      anchory: 0.5,
      scale: 4,
      ...this.sprites.bunny,
    };

    spriteBatch.flush();
    spriteBatch.add(sprite);
    spriteBatch.add({ ...sprite, x: x + 200, y: y + 200 });
    spriteBatch.renderWithRotation(sprite.x, sprite.y, Math.PI * t);
    spriteBatch.clear();

    this.spriteFontBatch.add({
      x: 0,
      y: 0,
      text: `FPS: ${this.game.getFPS()}`,
      scalex: 2,
      scaley: 2,
    });

    spriteBatch.flush();
  }
}
