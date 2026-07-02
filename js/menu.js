import { GameEngine } from './engine.js';

export const Menu = {
    coins: parseInt(localStorage.getItem('stickman_coins')) || 0,

    init() {
        const coinCountElem = document.getElementById('coin-count');
        if (coinCountElem) {
            coinCountElem.innerText = this.coins;
        }
        GameEngine.init();
    },

    startMatch(mode) {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('game-hud').classList.remove('hidden');
        GameEngine.startMatch(mode);
    },

    quitMatch() {
        // Interrompe a partida na hora e limpa o mundo físico
        GameEngine.matchActive = false;
        if (GameEngine.engine && GameEngine.engine.world) {
            Matter.Composite.clear(GameEngine.engine.world, false);
        }
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('game-hud').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    },

    showGameOver(winnerText) {
        this.coins += 100;
        localStorage.setItem('stickman_coins', this.coins);
        
        const coinCountElem = document.getElementById('coin-count');
        if (coinCountElem) coinCountElem.innerText = this.coins;

        alert(`${winnerText}\nVocê recebeu +$100 moedas!`);
        this.quitMatch();
    }
};

// Vincula ao escopo global para o onclick="window.Menu.quitMatch()" do HTML funcionar!
window.Menu = Menu;
