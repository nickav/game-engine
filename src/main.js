import { Game } from '@/components';

const canvas = document.getElementById('view');
const game = new Game(canvas);

game.setBackgroundColor(0, 0, 0, 1);
/*
game.state.set({
  render(re) {
    re.setBackgroundColor(0, 1, 0);
  }
});
*/

window.game = game;
