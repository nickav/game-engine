import { Game, Color, SpriteFontRenderer } from '@';

import tinyunicodeAtlas from '@public/tinyunicode.json';
import tinyunicodeSprite from '@public/tinyunicode.png';

const canvas = document.getElementById('view');
const game = new Game(canvas);

window.game = game;

game.setBackgroundColor(0, 0, 0);

// loading state
game.state.set({
  create() {
    game.loader.add('tinyunicode', tinyunicodeSprite).load((res) => {
      setTimeout(() => game.state.set(new Main(res)));
    });
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
    this.tex = assets.tinyunicode.texture;
  }

  create() {
    this.spriteFontBatch = new SpriteFontRenderer(
      this.game.renderer.spriteBatch,
      tinyunicodeAtlas
    );
  }

  render(re) {
    // draw triangle
    const { shapeBatch } = re;

    const t = (this.game.loop.time / 1000) % 2;
    const c = t <= 1 ? t : 2 - t;

    shapeBatch.triangle(0, 0, re.width, re.height, 0, re.height, [
      Color.make(1, 0, 0),
      Color.make(c, 1, 0),
      Color.make(c, 0, 1),
    ]);

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

    this.spriteFontBatch.add({
      x: 0,
      y: 0,
      text: `Hello!\nYou Rock!`,
      scalex: 4,
      scaley: 4,
      width: re.width,
      height: re.height,
      align: 'center',
      valign: 'center',
    });

    spriteBatch.flush();
  }
}
