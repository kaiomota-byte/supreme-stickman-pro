import { GameEngine } from './engine.js';
import { Storage } from './storage.js';

export const Menu = {
    saveData: Storage.load(),

    init() {
        const coinElem = document.getElementById('coin-count');
        if (coinElem) coinElem.innerText = this.saveData.coins;
    },

    changeScreen(screen) {
        document.querySelectorAll('.menu-screen').forEach(s => s.classList.add('hidden'));
        
        if (screen === 'game') {
            document.getElementById('gameCanvas').style.display = 'block';
            document.getElementById('game-hud').classList.remove('hidden');
        } else {
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
        const diff = document.getElementById('ai-difficulty').value;
        const w1 = document.getElementById('p1-weapon-select').value;
        const w2 = document.getElementById('p2-weapon-select').value;
        this.changeScreen('game');
        GameEngine.startMatch(mode, diff, w1, w2);
    },

    startLocalMatch() {
        const w1 = document.getElementById('p1-weapon-select').value;
        const w2 = document.getElementById('p2-weapon-select').value;
        this.changeScreen('game');
        GameEngine.startMatch('local', 'medium', w1, w2);
    },

    showGameOver(winnerText) {
        this.saveData.coins += 80;
        Storage.save(this.saveData);
        this.init();
        alert(`PARTIDA ENCERRADA\n${winnerText}\nRecompensa: +$80 moedas!`);
        this.changeScreen('main');
    },

    buyItem(id, price) {
        if (this.saveData.coins >= price) {
            this.saveData.coins -= price;
            this.init();
            Storage.save(this.saveData);
            alert("Item adquirido!");
        } else {
            alert("Saldo insuficiente!");
        }
    }
};

window.Menu = Menu;
window.Menu.changeScreen = Menu.changeScreen.bind(Menu);
window.Menu.startMatch = Menu.startMatch.bind(Menu);
window.Menu.startLocalMatch = Menu.startLocalMatch.bind(Menu);
window.Menu.buyItem = Menu.buyItem.bind(Menu);
