import { WeaponFactory } from './weapons.js';

export class StickmanRagdoll {
    constructor(engine, x, y, color, weaponType) {
        this.engine = engine;
        this.color = color;
        this.hp = 100;
        this.alive = true;

        const { Bodies, Constraint, Composite } = Matter;

        // Estrutura física Multi-Corpos (Ragdoll)
        this.head = Bodies.circle(x, y - 30, 14, { friction: 0.1, label: "player_head", render: { fillStyle: color } });
        this.torso = Bodies.rectangle(x, y + 10, 16, 45, { friction: 0.1, label: "player_body", render: { fillStyle: color } });
        
        // Membros Inferiores para Impactos Naturais
        this.leftLeg = Bodies.rectangle(x - 8, y + 45, 8, 30, { friction: 0.2, render: { fillStyle: color } });
        this.rightLeg = Bodies.rectangle(x + 8, y + 45, 8, 30, { friction: 0.2, render: { fillStyle: color } });

        // Conexões de Juntas Articuladas (Constraints)
        this.neck = Constraint.create({ bodyA: this.head, bodyB: this.torso, pointA: { x: 0, y: 14 }, pointB: { x: 0, y: -23 }, stiffness: 0.6, render: { visible: false } });
        this.jL = Constraint.create({ bodyA: this.torso, bodyB: this.leftLeg, pointA: { x: -6, y: 20 }, pointB: { x: 0, y: -15 }, stiffness: 0.4, render: { visible: false } });
        this.jR = Constraint.create({ bodyA: this.torso, bodyB: this.rightLeg, pointA: { x: 6, y: 20 }, pointB: { x: 0, y: -15 }, stiffness: 0.4, render: { visible: false } });

        // Acoplamento Dinâmico do Arsenal Escolhido
        this.weapon = WeaponFactory.create(engine, x + 35, y, weaponType);
        this.handJoint = Constraint.create({
            bodyA: this.torso, bodyB: this.weapon,
            pointA: { x: 10, y: -5 }, pointB: { x: -this.weapon.gameConfig.length/2, y: 0 },
            stiffness: 0.8, length: 5, render: { strokeStyle: color, lineWidth: 3 }
        });

        this.composite = Composite.create();
        Composite.add(this.composite, [this.head, this.torso, this.leftLeg, this.rightLeg, this.neck, this.jL, this.jR, this.weapon, this.handJoint]);
        Composite.add(engine.world, this.composite);
    }

    move(dir) {
        if (!this.alive) return;
        Matter.Body.setVelocity(this.torso, { x: dir * 5.0, y: this.torso.velocity.y });
    }

    jump() {
        if (!this.alive) return;
        if (Math.abs(this.torso.velocity.y) < 0.2) {
            Matter.Body.setVelocity(this.torso, { x: this.torso.velocity.x, y: -10.5 });
        }
    }

    attack(forceSign) {
        if (!this.alive) return;
        // Efeito físico rotacional violento de pancada
        Matter.Body.setAngularVelocity(this.weapon, forceSign * 0.6);
        Matter.Body.applyForce(this.torso, this.torso.position, { x: forceSign * 0.002, y: -0.001 });
    }

    takeDamage(amount, attackerBody) {
        if (!this.alive) return;
        this.hp -= amount;
        
        // Mecânica Avançada de Ragdoll: Empurrão baseado no vetor de impacto
        if (attackerBody) {
            const forceVec = { x: (this.torso.position.x - attackerBody.position.x) * 0.0005, y: -0.003 };
            Matter.Body.applyForce(this.torso, this.torso.position, forceVec);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        this.alive = false;
        // Desconecta as amarras mecânicas para fazer o boneco desabar mole no chão (Ragdoll Desarticulado)
        Matter.Composite.remove(this.engine.world, this.neck);
        Matter.Composite.remove(this.engine.world, this.handJoint);
        
        // Aplica uma força explosiva para espalhar os pedaços
        Matter.Body.applyForce(this.head, this.head.position, { x: (Math.random()-0.5)*0.02, y: -0.02 });
        Matter.Body.applyForce(this.torso, this.torso.position, { x: (Math.random()-0.5)*0.02, y: -0.01 });
        
        setTimeout(() => {
            window.Menu.showGameOver(this.color === '#ff3b30' ? 'BOT / PLAYER 2 VENCEU!' : 'JOGADOR 1 VENCEU!');
        }, 1500);
    }
}
