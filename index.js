import {TangramGame} from './game.js'
import {LevelSelector} from './levelSelector.js'

let game = new TangramGame();
window.game = game;
window.levelSelector = new LevelSelector(game);





// game.gameLoop()