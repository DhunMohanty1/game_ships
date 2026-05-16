import { GameLoop } from './game/GameLoop.js';

const ui = {
  root: document.getElementById('ui'),
  title: document.getElementById('title'),
  hint: document.getElementById('hint'),
};

const game = new GameLoop(ui);
game.start();