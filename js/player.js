export class StickmanRagdoll {
    constructor(engine, x, y, color, weaponType) {
        this.engine = engine;
        this.color = color;
        this.hp = 100;
        this.alive = true;
        this.facing = x < 640 ? 1 : -1;

        const { Bodies, Constraint, Composite } = Matter;
        const group = Matter.Body.nextGroup(true);

        // CONFIGURAÇÃO DO CORPO COMPLETO RAGDOLL
        this.head = Bodies.circle(x, y - 45, 12, { collisionFilter: { group: group }, friction: 0.1, label: "player_head" });
        this.chest = Bodies.rectangle(x, y - 15, 14, 25, { collisionFilter: { group: group }, friction: 0.1, label: "player_body" });
        this.belly = Bodies.rectangle(x, y + 10, 12, 20, { collisionFilter: { group: group }, friction: 0.1, label: "player_body" });

        // Braço Esquerdo
        this.leftUpperArm = Bodies.rectangle(x - 12, y - 15, 6, 20, { collisionFilter: { group: group } });
        this.leftLowerArm = Bodies.rectangle(x - 12, y + 2, 5, 18, { collisionFilter: { group: group } });
        // Braço Direito
        this.rightUpperArm = Bodies.rectangle(x + 12, y - 15, 6, 20, { collisionFilter: { group: group } });
        this.rightLowerArm = Bodies.rectangle(x + 12, y + 2, 5, 18, { collisionFilter: { group: group } });

        // Perna Esquerda
        this.leftUpperLeg = Bodies.rectangle(x - 6, y + 30, 7, 22, { collisionFilter: { group: group } });
        this.leftLowerLeg = Bodies.rectangle(x - 6, y + 50, 6, 20, { collisionFilter: { group: group } });
        // Perna Direito
        this.rightUpperLeg = Bodies.rectangle(x + 6, y + 30, 7, 22, { collisionFilter: { group: group } });
        this.rightLowerLeg = Bodies.rectangle(x + 6, y + 50, 6, 20, { collisionFilter: { group: group } });

        // Cores personalizadas nos metadados para renderização avançada
        [this.head, this.chest, this.belly, this.leftUpperArm, this.leftLowerArm, this.rightUpperArm, this.rightLowerArm, this.leftUpperLeg, this.leftLowerLeg, this.rightUpperLeg, this.rightLowerLeg].forEach(b => {
            b.render.fillStyle = color;
            b.isStickmanPart = true;
        });

        // JUNTAS E ARTICULAÇÕES ELÁSTICAS (CONSTRAINTS)
        const joints = [
            Constraint.create({ bodyA: this.head, bodyB: this.chest, pointA: { x: 0, y: 12 }, pointB: { x: 0, y: -14 }, stiffness: 0.8 }),
            Constraint.create({ bodyA: this.chest, bodyB: this.belly, pointA: { x: 0, y: 13 }, pointB: { x: 0, y: -11 }, stiffness: 0.8 }),
            // Braço E
            Constraint.create({ bodyA: this.chest, bodyB: this.leftUpperArm, pointA: { x: -8, y: -10 }, pointB: { x: 0, y: -10 }, stiffness: 0.7 }),
            Constraint.create({ bodyA: this.leftUpperArm, bodyB: this.leftLowerArm, pointA: { x: 0, y: 10 }, pointB: { x: 0, y: -9 }, stiffness: 0.7 }),
            // Braço D
            Constraint.create({ bodyA: this.chest, bodyB: this.rightUpperArm, pointA: { x: 8, y: -10 }, pointB: { x: 0, y: -10 }, stiffness: 0.7 }),
            Constraint.create({ bodyA: this.rightUpperArm, bodyB: this.rightLowerArm, pointA: { x: 0, y: 10 }, pointB: { x: 0, y: -9 }, stiffness: 0.7 }),
            // Perna E
            Constraint.create({ bodyA: this.belly, bodyB: this.leftUpperLeg, pointA: { x: -4, y: 10 }, pointB: { x: 0, y: -11 }, stiffness: 0.7 }),
            Constraint.create({ bodyA: this.leftUpperLeg, bodyB: this.leftLowerLeg, pointA: { x: 0, y: 11 }, pointB: { x: 0, y: -10 }, stiffness: 0.7 }),
            // Perna D
            Constraint.create({ bodyA: this.belly, bodyB: this.rightUpperLeg, pointA: { x: 4, y: 10 }, pointB: { x: 0, y: -11 }, stiffness: 0.7 }),
            Constraint.create({ bodyA: this.rightUpperLeg, bodyB: this.rightLowerLeg, pointA: { x: 0, y: 11 }, pointB: { x: 0, y: -10 }, stiffness: 0.7 })
        ];

        // EQUIPAMENTO DA ARMA COM ESTILO REALISTA
        this.weaponType = weaponType;
        const mainArm = this.facing === 1 ? this.rightLowerArm : this.leftLowerArm;
        this.weapon = window.WeaponFactory.create(engine, x + (25 * this.facing), y - 15, weaponType);
        
        this.handJoint = Constraint.create({
            bodyA: mainArm, bodyB: this.weapon,
            pointA: { x: 0, y: 8 }, pointB: { x: -this.weapon.gameConfig.length / 3, y: 0 },
            stiffness: 0.9, length: 2
        });

        this.composite = Composite.create();
        Composite.add(this.composite, [
            this.head, this.chest, this.belly, 
            this.leftUpperArm, this.leftLowerArm, this.rightUpperArm, this.rightLowerArm,
            this.leftUpperLeg, this.leftLowerLeg, this.rightUpperLeg, this.rightLowerLeg,
            ...joints, this.weapon, this.handJoint
        ]);
        Composite.add(engine.world, this.composite);
        this.setupCustomDrawing();
    }

    move(dir) {
        if (!this.alive) return;
        this.facing = dir;
        Matter.Body.setVelocity(this.chest, { x: dir * 4.5, y: this.chest.velocity.y });
    }

    jump() {
        if (!this.alive) return;
        if (Math.abs(this.belly.velocity.y) < 0.3) {
            Matter.Body.setVelocity(this.chest, { x: this.chest.velocity.x, y: -9.5 });
        }
    }

    attack(forceSign) {
        if (!this.alive) return;
        const config = this.weapon.gameConfig;
        
        if (config.type === "ranged" || config.type === "throwable") {
            if (!this.lastShot || Date.now() - this.lastShot > 600) {
                window.GameEngine.fireProjectile(this, config);
                this.lastShot = Date.now();
                // Aplica Recuo Físico da Arma Ranged
                Matter.Body.applyForce(this.chest, this.chest.position, { x: -this.facing * (config.recoil * 0.002), y: -0.001 });
            }
        } else {
            // Ataque Melee Rotacional
            Matter.Body.setAngularVelocity(this.weapon, forceSign * 0.5);
        }
    }

    setupCustomDrawing() {
        // Redesenha a arma usando canvas nativo para criar sprites realistas detalhados
        this.weapon.render.sprite = { visible: false };
        this.weapon.customDraw = (ctx) => {
            const config = this.weapon.gameConfig;
            ctx.save();
            ctx.translate(this.weapon.position.x, this.weapon.position.y);
            ctx.rotate(this.weapon.angle);
            
            ctx.shadowBlur = 8;
            ctx.shadowColor = config.color;

            if (config.type === "ranged") {
                // Desenho Detalhado de Armas de Fogo
                ctx.fillStyle = "#2c2c2e";
                ctx.fillRect(-config.length/2, -config.thickness/2, config.length, config.thickness); // Cano principal
                ctx.fillStyle = "#1c1c1e";
                ctx.fillRect(-config.length/2, 0, config.length/3, config.thickness * 1.5); // Cabo/Gatilho
                ctx.fillStyle = config.color; 
                ctx.fillRect(config.length/3, -config.thickness/4, config.length/6, config.thickness/2); // Mira / Laser
            } else {
                // Desenho Detalhado de Espadas, Katanas e Machados
                ctx.fillStyle = "#545456"; // Cabo de Madeira/Couro
                ctx.fillRect(-config.length/2, -config.thickness/3, config.length/4, config.thickness/1.5);
                ctx.fillStyle = config.color; // Lâmina de Metal brilhante
                ctx.beginPath();
                ctx.rect(-config.length/4, -config.thickness/2, (config.length * 0.75), config.thickness);
                ctx.fill();
            }
            ctx.restore();
        };
    }

    takeDamage(amount, attackerBody) {
        if (!this.alive) return;
        this.hp -= amount;
        
        if (attackerBody) {
            const pushX = (this.chest.position.x - attackerBody.position.x) > 0 ? 1 : -1;
            Matter.Body.applyForce(this.chest, this.chest.position, { x: pushX * 0.004, y: -0.002 });
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        this.alive = false;
        Matter.Composite.remove(this.engine.world, this.handJoint);
        
        // Espalha os membros do Ragdoll com força de explosão
        this.composite.bodies.forEach(b => {
            Matter.Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.01, y: -0.01 });
        });

        setTimeout(() => {
            window.Menu.showGameOver(this.color === '#ff3b30' ? 'PLAYER 2 VENCEU!' : 'JOGADOR 1 VENCEU!');
        }, 1800);
    }
}
