import {TangramGame} from './game.js'
import {Colormap} from './colormap.js'

let game = new TangramGame();
window.game = game;
new Colormap()

// game.gameLoop()