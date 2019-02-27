import { Game, Color, SpriteFontRenderer } from '@';

import fontAtlas from '@public/tinyunicode.json';
import fontSprite from '@public/tinyunicode.png';

const canvas = document.getElementById('view');
const game = new Game(canvas);

window.game = game;

game.setBackgroundColor(0, 0, 0);

game.state.set({
  create() {
    this.tex = null;

    this.game.loader
      .loadSprite(fontSprite)
      .then((res) => (this.tex = res.texture));

    this.spriteFontBatch = new SpriteFontRenderer(
      this.game.renderer.spriteBatch,
      fontAtlas
    );
    console.log(this.spriteFontBatch);
  },

  render(re) {
    // draw triangle
    const { shapeBatch } = re;

    const t = (this.game.loop.time / 1000) % 1;

    shapeBatch.triangle(0, 0, re.width, re.height, 0, re.height, [
      Color.make(1, 0, 0),
      Color.make(t, 1, 0),
      Color.make(t, 0, 1),
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
  },
});
