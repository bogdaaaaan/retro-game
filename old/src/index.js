import World from './js/world.js';
import View from './js/view.js';
import Game from './js/game.js';
import Sprite from './js/sprite.js';
import levels from '../data/levels.js';
import spriteMap from '../data/sprite-map.js';

const canvas = document.getElementById('scene');
const sprite = new Sprite('../assets/img/sprite.png', spriteMap);

const game = new Game({
    world: new World(),
    view: new View(canvas, sprite),
    levels
});

game.init().then(() => {
    game.start();
});
