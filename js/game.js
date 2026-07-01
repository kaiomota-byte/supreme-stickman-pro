// js/game.js
import { GameEngine } from './engine.js';
import { Menu } from './menu.js';

window.keys = {};

window.addEventListener('keydown', (e) => window.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => window.keys[e.key.toLowerCase()] = false);

window.addEventListener('DOMContentLoaded', () => {
    GameEngine.init();
    Menu.init();
});
