import { StickmanRagdoll } from './player.js';
import { RagdollAI } from './ai.js';
import { MapManager } from './maps.js';

export const GameEngine = {
    init() {
        const { Engine, Runner } = Matter;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1280; this.canvas.height = 720;
        
        this.engine = Engine.create();
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        this.setupCollisions();
        this.loop();
    },

    startMatch(mode) {
        const { Composite } = Matter;
        Composite.clear(this.engine.world, false);

        // Captura seleções da UI original
        const p1W = document.getElementById('p1-weapon-select').value;
        const p2W = document.getElementById('p2-weapon-select').value;
        const p1Color = document.getElementById('p1-color').value;
        const diff = document.getElementById('ai-difficulty').value;

        const maps = ['arena', 'lava', 'esteiras', 'espaco'];
        this.currentMapData = MapManager.load(this.engine, maps[Math.floor(Math.random() * maps.length)]);

        this.p1 = new StickmanRagdoll(this.engine, 300, 350, p1Color, p1W, false);
        
        if (mode === 'ai') {
            document.getElementById('p2-tag').innerText = `BOT (${diff.toUpperCase()})`;
            this.p2 = new StickmanRagdoll(this.engine, 980, 350, '#3b82f6', p2W, true);
            this.ai = new RagdollAI(this.p2, this.p1, diff);
        } else {
            document.getElementById('p2-tag').innerText = "JOGADOR 2";
            this.p2 = new StickmanRagdoll(this.engine, 980, 350, '#a855f7', p2W, true);
            this.ai = null;
        }

        this.mode = mode;
        this.matchActive = true;
    },

    fireProjectile(shooter, config) {
        const { Bodies, Composite, Body } = Matter;
        const b = Bodies.circle(shooter.chest.position.x + (40 * shooter.facing), shooter.chest.position.y, 5, {
            label: "bullet", density: 0.006
        });
        b.damageValue = config.damage;
        b.shooter = shooter;
        b.color = config.color;
        Body.setVelocity(b, { x: shooter.facing * 20, y: (Math.random() - 0.5) * 2 });
        Composite.add(this.engine.world, b);
    },

    setupCollisions() {
        Matter.Events.on(this.engine, 'collisionStart', (e) => {
            e.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                // Dano por colisão de Armas Melee corpo a corpo
                if (bodyA.label === 'weapon' && bodyB.isStickmanPart && bodyA.owner !== bodyB.owner) bodyB.owner.takeDamage(bodyA.gameConfig.damage, bodyA);
                if (bodyB.label === 'weapon' && bodyA.isStickmanPart && bodyB.owner !== bodyA.owner) bodyA.owner.takeDamage(bodyB.gameConfig.damage, bodyB);

                // Dano por Projéteis Balísticos
                if (bodyA.label === 'bullet' && bodyB.isStickmanPart && bodyA.shooter !== bodyB.owner) {
                    bodyB.owner.takeDamage(bodyA.damageValue, bodyA);
                    Matter.Composite.remove(this.engine.world, bodyA);
                }
                if (bodyB.label === 'bullet' && bodyA.isStickmanPart && bodyB.shooter !== bodyA.owner) {
                    bodyA.owner.takeDamage(bodyB.damageValue, bodyB);
                    Matter.Composite.remove(this.engine.world, bodyB);
                }

                // Armadilhas letais
                if (bodyA.label === 'lava' && bodyB.isStickmanPart) bodyB.owner.takeDamage(100);
                if (bodyB.label === 'lava' && bodyA.isStickmanPart) bodyA.owner.takeDamage(100);
            });
        });

        Matter.Events.on(this.engine, 'collisionActive', (e) => {
            e.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                if (bodyA.label === 'conveyor' && bodyB.isStickmanPart) {
                    Matter.Body.setVelocity(bodyB, { x: bodyA.speedValue, y: bodyB.velocity.y });
                }
            });
        });
    },

    endMatch(msg) {
        if (!this.matchActive) return;
        this.matchActive = false;
        window.Menu.showGameOver(msg);
    },

    loop() {
        requestAnimationFrame(() => this.loop());
        
        // Limpa a tela e redesenha cenários/bonecos manualmente com arte vetorial limpa
        this.ctx.fillStyle = "#09090b";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenha plataformas do mapa carregado
        const bodies = Matter.Composite.allBodies(this.engine.world);
        bodies.forEach(b => {
            if (b.mapColor) {
                this.ctx.fillStyle = b.mapColor;
                this.ctx.fillRect(b.position.x - b.w/2, b.position.y - b.h/2, b.w, b.h);
            }
            if (b.label === 'bullet') {
                this.ctx.fillStyle = b.color || '#fff';
                this.ctx.beginPath(); this.ctx.arc(b.position.x, b.position.y, 5, 0, Math.PI*2); this.ctx.fill();
            }
        });

        if (!this.matchActive || !this.p1 || !this.p2) return;

        // CONTROLES SEPARADOS JOGADOR 1
        if (window.keys['a']) this.p1.move(-1);
        if (window.keys['d']) this.p1.move(1);
        if (window.keys['w']) this.p1.jump();
        if (window.keys['s']) this.p1.attack(0.5);

        // CONTROLES DO JOGADOR 2 OU ATUAÇÃO DA IA AUTÔNOMA
        if (this.ai) {
            this.ai.update();
        } else {
            if (window.keys['arrowleft']) this.p2.move(-1);
            if (window.keys['arrowright']) this.p2.move(1);
            if (window.keys['arrowup']) this.p2.jump();
            if (window.keys['arrowdown']) this.p2.attack(-0.5);
        }

        // Renderiza os Bonecos Ragdoll articulados
        this.p1.draw(this.ctx);
        this.p2.draw(this.ctx);

        // Atualização imediata das barras do HUD
        document.getElementById('hp-p1').style.width = `${this.p1.hp}%`;
        document.getElementById('hp-p2').style.width = `${this.p2.hp}%`;
    }
};
