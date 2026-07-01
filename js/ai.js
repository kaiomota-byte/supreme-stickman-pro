export class RagdollAI {
    constructor(playerInstance, targetInstance, difficulty = 'medium') {
        this.player = playerInstance;
        this.target = targetInstance;
        this.difficulty = difficulty;
        
        this.rates = { easy: 0.2, medium: 0.5, hard: 0.8, extreme: 0.98 };
        this.intelligence = this.rates[difficulty];
    }

    update() {
        if (!this.player.alive || !this.target.alive) return;

        const pPos = this.player.torso.position;
        const tPos = this.target.torso.position;
        const distanceX = tPos.x - pPos.x;

        if (Math.random() > this.intelligence) return; // Simula delay humano de reação

        // Movimentação Persecutória
        if (distanceX > 40) {
            this.player.move(1);
        } else if (distanceX < -40) {
            this.player.move(-1);
        }

        // Lógica de salto e evasão baseada em altura relativa
        if (tPos.y < pPos.y - 80 && Math.random() < 0.08) {
            this.player.jump();
        }

        // Ativação da mecânica de ataque giratório baseado no alcance da arma acoplada
        if (Math.abs(distanceX) < 160) {
            this.player.attack(distanceX > 0 ? 0.35 : -0.35);
        }
    }
}
