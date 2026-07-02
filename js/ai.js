export class RagdollAI {
    constructor(bot, target, difficulty) {
        this.bot = bot;
        this.target = target;
        this.difficulty = difficulty;
    }

    update() {
        if (!this.bot.alive || !this.target.alive) return;

        const botPos = this.bot.chest.position;
        const targetPos = this.target.chest.position;
        const distX = targetPos.x - botPos.x;
        const distY = targetPos.y - botPos.y;

        // Calibração de reação: quanto maior a dificuldade, mais rápido e preciso o bot responde
        let rate = 0.35;
        if (this.difficulty === 'medium') rate = 0.55;
        if (this.difficulty === 'hard') rate = 0.75;
        if (this.difficulty === 'extreme') rate = 0.92;

        // Se o número aleatório for maior que a taxa de reação, o bot "vacila" por um frame (ritmo humano)
        if (Math.random() > rate) return;

        const config = this.bot.weapon.gameConfig;

        if (config.type === "ranged") {
            // ESTRATÉGIA PARA ARMAS DE TIRO: manter distância segura para disparar
            if (Math.abs(distX) > 380) {
                // Se estiver muito longe, ele se aproxima um pouco
                this.bot.move(Math.sign(distX));
            } else if (Math.abs(distX) < 200) {
                // Se o jogador chegar muito perto, o bot recua para trás para tentar atirar
                this.bot.move(-Math.sign(distX));
            }
            
            // Só atira se o jogador estiver mais ou menos na mesma linha de altura (evita gastar bala à toa)
            if (Math.abs(distY) < 140) {
                this.bot.attack(-this.bot.facing);
            }
        } else {
            // ESTRATÉGIA PARA ARMAS CORPO A CORPO (Melee / Motosserra)
            // Avança agressivamente na direção do jogador
            this.bot.move(Math.sign(distX));
            
            // Se o jogador pular por cima dele, o bot tenta pular junto para interceptar no ar
            if (distY < -80 && Math.abs(distX) < 150) {
                this.bot.jump();
            }

            // Ataca apenas quando a distância física for menor que o alcance da própria lâmina + margem
            if (Math.hypot(distX, distY) < config.length + 40) {
                // Desfere o golpe aplicando o giro na direção correta
                this.bot.attack(distX > 0 ? 0.3 : -0.3);
            }
        }
    }
}
