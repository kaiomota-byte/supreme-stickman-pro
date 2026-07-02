import { StickmanRagdoll } from './player.js';
import { RagdollAI } from './ai.js'; // Ajuste o caminho/nome se sua IA estiver em outro arquivo
import { Menu } from './menu.js';

export const GameEngine = {
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1280;
        this.canvas.height = 720;
        
        this.engine = Matter.Engine.create();
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);

        this.projectiles = [];
        this.setupCollisions();
        this.loop();
    },

    startMatch(mode) {
        this.projectiles = [];
        Matter.Composite.clear(this.engine.world, false);
        
        const p1W = document.getElementById('p1-weapon-select').value;
        const p2W = document.getElementById('p2-weapon-select').value;
        const p1Color = document.getElementById('p1-color').value;
        const diff = document.getElementById('ai-difficulty').value;

        // Ritmo de gravidade suavizado (0.5) para as quedas e saltos não parecerem acelerados
        this.engine.gravity.y = 0.5;

        // Criação do chão estável da arena
        const ground = Matter.Bodies.rectangle(640, 640, 1100, 40, { isStatic: true, label: "ground", friction: 0.4 });
        ground.mapColor = '#262626'; ground.w = 1100; ground.h = 40;
        Matter.Composite.add(this.engine.world, ground);

        // Inicialização dos lutadores Ragdoll
        this.p1 = new StickmanRagdoll(this.engine, 350, 400, p1Color, p1W, false);
        
        if (mode === 'ai') {
            document.getElementById('p2-tag').innerText = `BOT (${diff.toUpperCase()})`;
            this.p2 = new StickmanRagdoll(this.engine, 930, 400, '#3b82f6', p2W, true);
            this.ai = new RagdollAI(this.p2, this.p1, diff);
        } else {
            document.getElementById('p2-tag').innerText = "JOGADOR 2";
            this.p2 = new StickmanRagdoll(this.engine, 930, 400, '#a855f7', p2W, true);
            this.ai = null;
        }

        this.mode = mode;
        this.matchActive = true;
    },

    fireProjectile(shooter, config) {
        const angle = shooter.weapon.angle;
        // Calcula matematicamente a ponta do cano com base na direção em que o boneco está virado
        const spawnX = shooter.weapon.position.x + Math.cos(angle) * (config.length / 2) * shooter.facing;
        const spawnY = shooter.weapon.position.y + Math.sin(angle) * (config.length / 2);

        const b = Matter.Bodies.circle(spawnX, spawnY, 4, { 
            label: "bullet", 
            density: 0.01,
            frictionAir: 0.005 // Balística real (quase sem resistência do ar para não frear no meio da tela)
        });

        b.damageValue = config.damage;
        b.shooter = shooter;
        b.color = config.color;

        // Velocidade horizontal visível a olho nu, acompanhando a inclinação do cano
        Matter.Body.setVelocity(b, { 
            x: shooter.facing * 14, 
            y: Math.sin(angle) * 3 
        });
        
        this.projectiles.push(b);
        Matter.Composite.add(this.engine.world, b);
    },

    setupCollisions() {
        Matter.Events.on(this.engine, 'collisionStart', (e) => {
            e.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                
                // Colisões corporais por armas brancas (Melee)
                if (bodyA.label === 'weapon' && bodyB.isStickmanPart && bodyA.owner !== bodyB.owner) bodyB.owner.takeDamage(bodyA.gameConfig.damage, bodyA);
                if (bodyB.label === 'weapon' && bodyA.isStickmanPart && bodyB.owner !== bodyA.owner) bodyA.owner.takeDamage(bodyB.gameConfig.damage, bodyB);

                // Colisões balísticas de projéteis
                if (bodyA.label === 'bullet' && bodyB.isStickmanPart && bodyA.shooter !== bodyB.owner) {
                    bodyB.owner.takeDamage(bodyA.damageValue, bodyA);
                    Matter.Composite.remove(this.engine.world, bodyA);
                }
                if (bodyB.label === 'bullet' && bodyA.isStickmanPart && bodyB.shooter !== bodyA.owner) {
                    bodyA.owner.takeDamage(bodyB.damageValue, bodyB);
                    Matter.Composite.remove(this.engine.world, bodyB);
                }
            });
        });
    },

    endMatch(msg) {
        if (!this.matchActive) return;
        this.matchActive = false;
        Menu.showGameOver(msg);
    },

    loop() {
        requestAnimationFrame(() => this.loop());
        
        // Limpa e redesenha o fundo preto da arena
        this.ctx.fillStyle = "#0c0a09";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Renderiza objetos estáticos (chão) e projéteis ativos
        const bodies = Matter.Composite.allBodies(this.engine.world);
        bodies.forEach(b => {
            if (b.mapColor) {
                this.ctx.fillStyle = b.mapColor;
                this.ctx.fillRect(b.position.x - b.w/2, b.position.y - b.h/2, b.w, b.h);
            }
            if (b.label === 'bullet') {
                // Desenha o traçador luminoso da bala com brilho neon
                this.ctx.fillStyle = b.color || '#eab308';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = b.color || '#eab308';
                this.ctx.beginPath();
                this.ctx.arc(b.position.x, b.position.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0; // Limpa o efeito de borrão para não vazar nos bonecos
            }
        });

        if (!this.matchActive || !this.p1 || !this.p2) return;

        // ESCUTAS DE ENTRADA DO CONTROLE (JOGADOR 1)
        if (window.keys['a']) this.p1.move(-1);
        if (window.keys['d']) this.p1.move(1);
        if (window.keys['w']) this.p1.jump();
        if (window.keys['s']) this.p1.attack(1);

        // GERENCIAMENTO DO JOGADOR 2 (IA OU SEGUNDO PLAYER NO TECLADO)
        if (this.ai) {
            this.ai.update();
        } else {
            if (window.keys['arrowleft']) this.p2.move(-1);
            if (window.keys['arrowright']) this.p2.move(1);
            if (window.keys['arrowup']) this.p2.jump();
            if (window.keys['arrowdown']) this.p2.attack(-1);
        }

        // Desenha as silhuetas dos personagens e das armas
        this.p1.draw(this.ctx);
        this.p2.draw(this.ctx);

        // Sincroniza as barras de vida na tela do HUD
        document.getElementById('hp-p1').style.width = `${this.p1.hp}%`;
        document.getElementById('hp-p2').style.width = `${this.p2.hp}%`;
    }
};

// Vincula a engine à janela global para facilitar conexões e disparos
window.GameEngine = GameEngine;
window.keys = {};
window.addEventListener('keydown', (e) => { window.keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { window.keys[e.key.toLowerCase()] = false; });
