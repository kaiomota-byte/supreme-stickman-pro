import { GameEngine } from './engine.js';
import { Menu } from './menu.js';
import { WeaponFactory } from './weapons.js';

window.WeaponFactory = WeaponFactory; // Deixe essa linha ativa!

document.addEventListener('DOMContentLoaded', () => {
    GameEngine.init();
    Menu.init();
});

window.keys = {};
window.addEventListener('keydown', (e) => { window.keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { window.keys[e.key.toLowerCase()] = false; });
