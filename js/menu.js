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
        const diffElem = document.getElementById('ai-difficulty');
        const diff = diffElem ? diffElem.value : 'medium';
        this.changeScreen('game');
        GameEngine.startMatch('ai', diff);
    },

    startLocalMatch() {
        this.changeScreen('game');
        GameEngine.startMatch('local');
    },

    showGameOver(winnerText) {
        // Da um bônus de moedas para a carteira persistente do jogador
        this.saveData.coins += 100;
        Storage.save(this.saveData);
        this.init();

        alert(`FIM DE PARTIDA\n${winnerText}\nVocê ganhou +$100 moedas!`);
        this.changeScreen('main');
    },

    buyItem(id, price) {
        if (this.saveData.coins >= price) {
            this.saveData.coins -= price;
            this.init();
            Storage.save(this.saveData);
            alert("Item desbloqueado e adicionado ao arsenal!");
        } else {
            alert("Moedas insuficientes!");
        }
    }
};

window.Menu = Menu;
window.Menu.changeScreen = Menu.changeScreen.bind(Menu);
window.Menu.startMatch = Menu.startMatch.bind(Menu);
window.Menu.startLocalMatch = Menu.startLocalMatch.bind(Menu);
window.Menu.buyItem = Menu.buyItem.bind(Menu);
