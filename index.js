import { TangramGame } from './game.js'
import { LevelSelector } from './levelSelector.js'

let game = new TangramGame();
window.game = game;
const levelSelector = new LevelSelector(game);
window.levelSelector = levelSelector




// game.gameLoop()