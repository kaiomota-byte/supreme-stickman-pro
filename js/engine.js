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
            options: { 
                width: 1280, 
                height: 720, 
                wireframes: false, // ISSO DEVE ESTAR FALSA PARA APARECER CORES E DESENHOS
                background: '#0f0f12' 
            }
        });

        Render.run(this.render);
        Runner.run(this.runner, this.engine);
        this.projectiles = [];
        this.setupCollisions();
        this.loop();
    },
// ... o resto do código continua igualzinho ao que te mandei antes ...
