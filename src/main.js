import { Game, Color, SpriteFontRenderer } from '@';
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

  render(re) {
    const { shapeBatch, width, height } = re;

    const w2 = width * 0.5;
    const h2 = height * 0.5;
    const bar = { w: 128, h: 16 };

    //const t = (game.loop.time / 1000) % 1;
    const t = game.loader.percent;
    const c1 = Color.make(1, 0, 1);
    const c2 = Color.make(1, 1, 1);
    const fill = [c1, c2, c2, c1];

    // fill
    shapeBatch.rectangle(
      w2 - bar.w,
      h2 - bar.h,
      w2 - bar.w + 2 * t * bar.w,
      h2 + bar.h,
      fill
    );

    // outline
    shapeBatch.hollowRect(
      w2 - bar.w,
      h2 - bar.h,
      w2 + bar.w,
      h2 + bar.h,
      6,
      Color.BLACK
    );
    shapeBatch.hollowRect(w2 - bar.w, h2 - bar.h, w2 + bar.w, h2 + bar.h, 2);

    shapeBatch.flush();
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
  }

  create() {}

  render(re) {
    // draw rectangles
    const { shapeBatch } = re;
    const t = (this.game.loop.time / 1000) % 2;

    const rot = t * Math.PI * 2;

    shapeBatch.hollowRect(10, 10, 100, 100, 10, Color.make(0, 1, 0), 1, 0);
    shapeBatch.hollowRect(10, 10, 100, 100, 10, Color.make(1, 0, 0), 1, 1);
    shapeBatch.hollowRect(10, 10, 100, 100);

    shapeBatch.hollowArc(
      100,
      100,
      t * 40,
      rot,
      rot + Math.PI * 2,
      20,
      Color.WHITE,
      1,
      8
    );

    shapeBatch.flush();

    // draw sprite font
    const { spriteBatch } = re;
    spriteBatch.setTexture(this.tex);

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
