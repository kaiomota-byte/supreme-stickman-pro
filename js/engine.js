import { StickmanRagdoll } from './player.js';
import { RagdollAI } from './ai.js';
import { MapManager } from './maps.js';

export const GameEngine = {
    init() {
        const { Engine, Render, Runner } = Matter;
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.engine = Engine.create();
        this.runner = Runner.create();

        this.render = Render.create({
            canvas: this.canvas, engine: this.engine,
            options: { width: 1280, height: 720, wireframes: false, background: '#0f0f12' }
        });

        Render.run(this.render);
        Runner.run(this.runner, this.engine);
        this.projectiles = [];
        this.setupCollisions();
        this.loop();
    },

    startMatch(mode, aiDifficulty, p1Weapon, p2Weapon) {
        Matter.Composite.clear(this.engine.world, false);
        this.projectiles = [];
        
        const mapList = ['arena', 'lava', 'esteiras', 'espaco'];
        const randomMap = mapList[Math.floor(Math.random() * mapList.length)];
        MapManager.load(this.engine, randomMap);

        // Usa as armas escolhidas nas caixas de seleção do menu HTML
        this.p1 = new StickmanRagdoll(this.engine, 300, 300, '#ff3b30', p1Weapon);
        this.p2 = new StickmanRagdoll(this.engine, 980, 300, '#007aff', p2Weapon);

        this.mode = mode;
        this.ai = mode === 'ai' ? new RagdollAI(this.p2, this.p1, aiDifficulty) : null;
        document.getElementById('game-hud').classList.remove('hidden');
    },

    fireProjectile(shooter, config) {
        const { Bodies, Composite, Body } = Matter;
        const originX = shooter.chest.position.x + (45 * shooter.facing);
        const originY = shooter.chest.position.y - 5;

        const bullet = Bodies.circle(originX, originY, config.ammo === 'explosivo' ? 8 : 4, {
            label: "bullet",
            density: 0.005,
            render: { fillStyle: config.color }
        });

        bullet.damageValue = config.damage;
        bullet.shooter = shooter;
        bullet.isExplosive = config.ammo === 'explosivo' || config.ammo === 'foguete';

        Body.setVelocity(bullet, { x: shooter.facing * (config.ammo === 'explosivo' ? 8 : 22), y: -1 });
        this.projectiles.push(bullet);
        Composite.add(this.engine.world, bullet);
    },

    setupCollisions() {
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                // Colisão de Armas Brancas corpo a corpo
                if (bodyA.label === 'weapon' && bodyB.label === 'player_body' && window.GameEngine.p2.chest === bodyB) window.GameEngine.p2.takeDamage(bodyA.gameConfig.damage, bodyA);
                if (bodyB.label === 'weapon' && bodyA.label === 'player_body' && window.GameEngine.p1.chest === bodyA) window.GameEngine.p1.takeDamage(bodyB.gameConfig.damage, bodyB);

                // Tratamento Físico de Projéteis / Balas
                if (bodyA.label === 'bullet') this.handleBulletHit(bodyA, bodyB);
                if (bodyB.label === 'bullet') this.handleBulletHit(bodyB, bodyA);

                // Lava do cenário causa perda total
                if (bodyA.label === 'lava' && bodyB.isStickmanPart) this.p1.chest === bodyB ? this.p1.takeDamage(100) : this.p2.takeDamage(100);
                if (bodyB.label === 'lava' && bodyA.isStickmanPart) this.p1.chest === bodyA ? this.p1.takeDamage(100) : this.p2.takeDamage(100);
            });
        });
    },

    handleBulletHit(bullet, target) {
        if (target.isStickmanPart) {
            const hitPlayer = (this.p1.composite.bodies.includes(target)) ? this.p1 : this.p2;
            if (hitPlayer !== bullet.shooter) {
                hitPlayer.takeDamage(bullet.damageValue, bullet);
            }
        }
        // Se for explosivo, empurra os blocos ao redor
        if (bullet.isExplosive) {
            this.triggerExplosionForce(bullet.position);
        }
        Matter.Composite.remove(this.engine.world, bullet);
    },

    triggerExplosionForce(pos) {
        const bodies = Matter.Composite.allBodies(this.engine.world);
        bodies.forEach(b => {
            const dist = Matter.Vector.magnitude(Matter.Vector.sub(b.position, pos));
            if (dist < 120 && b.label === "player_body") {
                const forceFactor = (120 - dist) * 0.0001;
                Matter.Body.applyForce(b, b.position, { x: (b.position.x - pos.x) * forceFactor, y: -0.004 });
            }
        });
    },

    loop() {
        Matter.Events.on(this.engine, 'beforeUpdate', () => {
            // Renderização customizada das armas a cada quadro executado
            const ctx = this.canvas.getContext('2d');
            if (ctx && this.p1 && this.p2) {
                if (this.p1.weapon.customDraw) this.p1.weapon.customDraw(ctx);
                if (this.p2.weapon.customDraw) this.p2.weapon.customDraw(ctx);
            }

            if (!this.p1 || !this.p2) return;
            if (window.keys['a']) this.p1.move(-1);
            if (window.keys['d']) this.p1.move(1);
            if (window.keys['w']) this.p1.jump();
            if (window.keys['s']) this.p1.attack(0.4);

            if (this.mode === 'ai' && this.ai) {
                this.ai.update();
            } else if (this.mode === 'local') {
                if (window.keys['arrowleft']) this.p2.move(-1);
                if (window.keys['arrowright']) this.p2.move(1);
                if (window.keys['arrowup']) this.p2.jump();
                if (window.keys['arrowdown']) this.p2.attack(-0.4);
            }

            const hp1 = document.getElementById('hp-p1');
            const hp2 = document.getElementById('hp-p2');
            if (hp1) hp1.style.width = `${this.p1.hp}%`;
            if (hp2) hp2.style.width = `${this.p2.hp}%`;
        });
    }
};
