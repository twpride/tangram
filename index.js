import {TangramGame} from './game.js'

let game = new TangramGame();
window.game = game;
game.gameLoop()