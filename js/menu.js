// js/menu.js
import { GameEngine } from './engine.js';
import { Storage } from './storage.js';

export const Menu = {
    saveData: Storage.load(),

    init() {
        document.getElementById('coin-count').innerText = this.saveData.coins;
    },

    changeScreen(screen) {
        document.querySelectorAll('.menu-screen').forEach(s => s.classList.add('hidden'));
        if (screen !== 'game') {
            document.getElementById(`${screen}-menu`).classList.remove('hidden');
        }
    },

    startMatch(mode) {
        const diff = document.getElementById('ai-difficulty').value;
        this.changeScreen('game');
        GameEngine.startMatch('ai', diff);
    },

    startLocalMatch() {
        this.changeScreen('game');
        GameEngine.startMatch('local');
    },

    buyItem(id, price) {
        if (this.saveData.coins >= price) {
            this.saveData.coins -= price;
            document.getElementById('coin-count').innerText = this.saveData.coins;
            Storage.save(this.saveData);
            alert("Item adquirido com sucesso e enviado ao Arsenal!");
        } else {
            alert("Moedas insuficientes!");
        }
    }
};
window.Menu = Menu;
