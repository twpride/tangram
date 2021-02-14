import { TangramGame } from './game.js'
import { LevelSelector } from './levelSelector.js'
// import { LevelSelector } from './levelSelector_horz.js'

let game = new TangramGame();
window.game = game;
const levelSelector = new LevelSelector(game);
window.levelSelector = levelSelector




// game.gameLoop()