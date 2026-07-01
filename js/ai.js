export class RagdollAI {
    constructor(botPlayer, targetPlayer, difficulty) {
        this.bot = botPlayer;
        this.target = targetPlayer;
        this.difficulty = difficulty; // 'easy', 'medium', 'hard', 'extreme'
    }

    update() {
        if (!this.bot.alive || !this.target.alive) return;

        const botPos = this.bot.chest.position;
        const targetPos = this.target.chest.position;
        const distX = targetPos.x - botPos.x;
        const distY = targetPos.y - botPos.y;
        const totalDist = Math.hypot(distX, distY);

        const config = this.bot.weapon.gameConfig;
        
        // Fator de Reação baseado na Dificuldade Escolhida
        let reactionChance = 0.4;
        if (this.difficulty === 'medium') reactionChance = 0.65;
        if (this.difficulty === 'hard') reactionChance = 0.85;
        if (this.difficulty === 'extreme') reactionChance = 0.98;

        if (Math.random() > reactionChance) return;

        // ESTRATÉGIA DE MOVIMENTAÇÃO E ATAQUE INTELIGENTE
        if (config.type === "ranged" || config.type === "throwable") {
            // IA de Distância: Mantém recuo estratégico e atira de longe
            if (Math.abs(distX) > 400) {
                this.bot.move(Math.sign(distX));
            } else if (Math.abs(distX) < 200) {
                this.bot.move(-Math.sign(distX)); // Recua se o jogador chegar perto
            }
            
            // Atira se estiver alinhado visualmente com o alvo
            if (Math.abs(distY) < 150) {
                this.bot.attack(-this.bot.facing);
            }
        } else {
            // IA Corpo a Corpo (Melee): Investida agressiva
            this.bot.move(Math.sign(distX));
            
            if (totalDist < config.length + 40) {
                this.bot.attack(distX > 0 ? 0.5 : -0.5);
            }
        }

        // IA Inteligente pula obstáculos ou buracos de lava
        if (distY < -80 && Math.abs(distX) < 200 && Math.random() < 0.5) {
            this.bot.jump();
        }
    }
}
