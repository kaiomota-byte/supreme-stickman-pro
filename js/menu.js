import { GameEngine } from './engine.js';
import { Storage } from './storage.js';

export const Menu = {
    saveData: Storage.load(),

    init() {
        const coinElem = document.getElementById('coin-count');
        if (coinElem) coinElem.innerText = this.saveData.coins;
    },

    changeScreen(screen) {
        // Esconde absolutamente todas as telas de menu
        document.querySelectorAll('.menu-screen').forEach(s => s.classList.add('hidden'));
        
        if (screen === 'game') {
            // Mostra a tela de jogo e o Canvas
            document.getElementById('gameCanvas').style.display = 'block';
            document.getElementById('game-hud').classList.remove('hidden');
        } else {
            // Volta para a tela solicitada (ou a principal)
            document.getElementById('gameCanvas').style.display = 'none';
            document.getElementById('game-hud').classList.add('hidden');
            
            const target = document.getElementById(`${screen}-menu`);
            if (target) {
                target.classList.remove('hidden');
            } else if (screen === 'main') {
                document.getElementById('main-menu').classList.remove('hidden');
            }
        }
    },

    startMatch(mode) {
        const diffElem = document.getElementById('ai-difficulty');
        const diff = diffElem ? diffElem.value : 'medium';
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
            const coinElem = document.getElementById('coin-count');
            if (coinElem) coinElem.innerText = this.saveData.coins;
            Storage.save(this.saveData);
            alert("Item adquirido com sucesso e enviado ao Arsenal!");
        } else {
            alert("Moedas insuficientes!");
        }
    }
};

// Vincula o Menu globalmente para o HTML conseguir clicar
window.Menu = Menu;
window.Menu.changeScreen = Menu.changeScreen.bind(Menu);
window.Menu.startMatch = Menu.startMatch.bind(Menu);
window.Menu.startLocalMatch = Menu.startLocalMatch.bind(Menu);
window.Menu.buyItem = Menu.buyItem.bind(Menu);
