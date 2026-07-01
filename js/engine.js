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
            canvas: this.canvas,
            engine: this.engine,
            options: { width: 1280, height: 720, wireframes: false, background: '#141419' }
        });

        Render.run(this.render);
        Runner.run(this.runner, this.engine);

        this.setupCollisions();
        this.loop();
    },

    startMatch(mode, aiDifficulty) {
        Matter.Composite.clear(this.engine.world, false);
        
        MapManager.load(this.engine, 'arena');

        this.p1 = new StickmanRagdoll(this.engine, 300, 400, '#ff3b30', 'katana');
        this.p2 = new StickmanRagdoll(this.engine, 980, 400, '#007aff', 'hammer');

        this.mode = mode;
        this.ai = mode === 'ai' ? new RagdollAI(this.p2, this.p1, aiDifficulty) : null;

        document.getElementById('game-hud').classList.remove('hidden');
    },

    setupCollisions() {
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                if (bodyA.label === 'weapon' && bodyB.label === 'player_body') {
                    this.processHit(bodyA, this.p2);
                }
                if (bodyB.label === 'weapon' && bodyA.label === 'player_body') {
                    this.processHit(bodyB, this.p1);
                }
            });
        });
    },

    processHit(weaponBody, damagedPlayer) {
        if (Math.abs(weaponBody.angularVelocity) > 0.05) {
            const dmg = weaponBody.gameConfig.damage;
            damagedPlayer.takeDamage(dmg);
            this.triggerScreenShake();
        }
    },

    triggerScreenShake() {
        this.canvas.style.transform = `translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*10}px)`;
        setTimeout(() => this.canvas.style.transform = 'none', 50);
    },

    loop() {
        Matter.Events.on(this.engine, 'beforeUpdate', () => {
            if (!this.p1) return;

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

            document.getElementById('hp-p1').style.width = `${Math.max(0, this.p1.hp)}%`;
            document.getElementById('hp-p2').style.width = `${Math.max(0, this.p2.hp)}%`;
        });
    }
};
