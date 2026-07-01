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
            const target = document.getElementById(`${screen}-menu`);
            if (target) target.classList.remove('hidden');
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

// Vincula o Menu globalmente e garante o escopo correto para as funções de clique
window.Menu = Menu;
window.Menu.changeScreen = Menu.changeScreen.bind(Menu);
window.Menu.startMatch = Menu.startMatch.bind(Menu);
window.Menu.startLocalMatch = Menu.startLocalMatch.bind(Menu);
window.Menu.buyItem = Menu.buyItem.bind(Menu);
