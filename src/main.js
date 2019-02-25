import { Game, Color } from '@';

const canvas = document.getElementById('view');
const game = new Game(canvas);

game.setBackgroundColor(0, 0, 0);

game.state.set({
  render(re) {
    const { shapeBatch } = re;

    shapeBatch.triangle(0, 0, re.width, re.height, 0, re.height, [
      Color.make(1, 0, 0),
      Color.make(0, 1, 0),
      Color.make(0, 0, 1),
    ]);

    shapeBatch.flush();
  },
});

window.game = game;
