import { WeaponFactory } from './weapons.js';

export class StickmanRagdoll {
    constructor(engine, x, y, color, weaponType) {
        this.engine = engine;
        this.color = color;
        this.hp = 100;
        this.alive = true;

        const { Bodies, Constraint, Composite } = Matter;

        // Ragdoll estruturado de forma anatômica leve
        this.head = Bodies.circle(x, y - 25, 14, { friction: 0.05, label: "player_head", render: { fillStyle: color } });
        this.torso = Bodies.rectangle(x, y + 15, 18, 42, { friction: 0.1, label: "player_body", render: { fillStyle: color } });

        this.neck = Constraint.create({
            bodyA: this.head, bodyB: this.torso,
            pointA: { x: 0, y: 14 }, pointB: { x: 0, y: -21 },
            stiffness: 0.7, render: { visible: false }
        });

        // Fábrica de Armas acopla o item dinamicamente à mão do boneco
        this.weapon = WeaponFactory.create(engine, x + 30, y, weaponType);

        this.handJoint = Constraint.create({
            bodyA: this.torso, bodyB: this.weapon,
            pointA: { x: 12, y: -5 }, pointB: { x: -this.weapon.gameConfig.length/2, y: 0 },
            stiffness: 0.9, length: 2,
            render: { strokeStyle: color, lineWidth: 4 }
        });

        Composite.add(engine.world, [this.head, this.torso, this.neck, this.weapon, this.handJoint]);
    }

    move(dir) {
        Matter.Body.setVelocity(this.torso, { x: dir * 4.5, y: this.torso.velocity.y });
    }

    jump() {
        if (Math.abs(this.torso.velocity.y) < 0.1) {
            Matter.Body.setVelocity(this.torso, { x: this.torso.velocity.x, y: -9.5 });
        }
    }

    attack(forceSign) {
        Matter.Body.setAngularVelocity(this.weapon, forceSign);
        // Aplica empuxo vetorial baseado na física clássica de rotações do jogo original
        Matter.Body.applyForce(this.torso, this.torso.position, { x: forceSign * 0.0015, y: -0.0008 });
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) this.alive = false;
    }
}
