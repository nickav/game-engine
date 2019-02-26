import { Game, Color } from '@';

const canvas = document.getElementById('view');
const game = new Game(canvas);

game.setBackgroundColor(0, 0, 0);

game.state.set({
  render(re) {
    const { shapeBatch } = re;

    const t = (this.game.loop.time / 1000) % 1;

    shapeBatch.triangle(0, 0, re.width, re.height, 0, re.height, [
      Color.make(1, 0, 0),
      Color.make(t, 1, 0),
      Color.make(t, 0, 1),
    ]);

    shapeBatch.flush();
  },
});

window.game = game;
