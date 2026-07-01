export class StickmanRagdoll {
    constructor(engine, x, y, color, weaponType, isPlayer2 = false) {
        this.engine = engine;
        this.color = color;
        this.hp = 100;
        this.alive = true;
        this.facing = isPlayer2 ? -1 : 1;
        this.isPlayer2 = isPlayer2;

        const { Bodies, Constraint, Composite } = Matter;
        const group = Matter.Body.nextGroup(true);

        // CONSTRUÇÃO ANATÔMICA COMPLETA RAGDOLL (Articulado)
        this.head = Bodies.circle(x, y - 40, 11, { collisionFilter: { group: group }, friction: 0.1, label: "player_head" });
        this.chest = Bodies.rectangle(x, y - 12, 12, 22, { collisionFilter: { group: group }, friction: 0.1, label: "player_body" });
        this.bacia = Bodies.rectangle(x, y + 12, 12, 16, { collisionFilter: { group: group }, friction: 0.1, label: "player_body" });

        this.lUpperArm = Bodies.rectangle(x - 14, y - 12, 6, 18, { collisionFilter: { group: group } });
        this.lLowerArm = Bodies.rectangle(x - 14, y + 4, 5, 16, { collisionFilter: { group: group } });
        this.rUpperArm = Bodies.rectangle(x + 14, y - 12, 6, 18, { collisionFilter: { group: group } });
        this.rLowerArm = Bodies.rectangle(x + 14, y + 4, 5, 16, { collisionFilter: { group: group } });

        this.lUpperLeg = Bodies.rectangle(x - 6, y + 28, 6, 20, { collisionFilter: { group: group }, friction: 0.2 });
        this.lLowerLeg = Bodies.rectangle(x - 6, y + 46, 5, 18, { collisionFilter: { group: group }, friction: 0.2 });
        this.rUpperLeg = Bodies.rectangle(x + 6, y + 28, 6, 20, { collisionFilter: { group: group }, friction: 0.2 });
        this.rLowerLeg = Bodies.rectangle(x + 6, y + 46, 5, 18, { collisionFilter: { group: group }, friction: 0.2 });

        this.parts = [this.head, this.chest, this.bacia, this.lUpperArm, this.lLowerArm, this.rUpperArm, this.rLowerArm, this.lUpperLeg, this.lLowerLeg, this.rUpperLeg, this.rLowerLeg];
        this.parts.forEach(p => { p.isStickmanPart = true; p.owner = this; });

        // CONEXÕES DE JUNTA RAGDOLL FLUIDA
        this.joints = [
            Constraint.create({ bodyA: this.head, bodyB: this.chest, pointA: { x: 0, y: 11 }, pointB: { x: 0, y: -12 }, stiffness: 0.85, render: { visible: false } }),
            Constraint.create({ bodyA: this.chest, bodyB: this.bacia, pointA: { x: 0, y: 11 }, pointB: { x: 0, y: -9 }, stiffness: 0.85, render: { visible: false } }),
            Constraint.create({ bodyA: this.chest, bodyB: this.lUpperArm, pointA: { x: -7, y: -8 }, pointB: { x: 0, y: -8 }, stiffness: 0.7, render: { visible: false } }),
            Constraint.create({ bodyA: this.lUpperArm, bodyB: this.lLowerArm, pointA: { x: 0, y: 9 }, pointB: { x: 0, y: -8 }, stiffness: 0.7, render: { visible: false } }),
            Constraint.create({ bodyA: this.chest, bodyB: this.rUpperArm, pointA: { x: 7, y: -8 }, pointB: { x: 0, y: -8 }, stiffness: 0.7, render: { visible: false } }),
            Constraint.create({ bodyA: this.rUpperArm, bodyB: this.rLowerArm, pointA: { x: 0, y: 9 }, pointB: { x: 0, y: -8 }, stiffness: 0.7, render: { visible: false } }),
            Constraint.create({ bodyA: this.bacia, bodyB: this.lUpperLeg, pointA: { x: -4, y: 8 }, pointB: { x: 0, y: -9 }, stiffness: 0.7, render: { visible: false } }),
            Constraint.create({ bodyA: this.lUpperLeg, bodyB: this.lLowerLeg, pointA: { x: 0, y: 10 }, pointB: { x: 0, y: -9 }, stiffness: 0.7, render: { visible: false } }),
            Constraint.create({ bodyA: this.bacia, bodyB: this.rUpperLeg, pointA: { x: 4, y: 8 }, pointB: { x: 0, y: -9 }, stiffness: 0.7, render: { visible: false } }),
            Constraint.create({ bodyA: this.rUpperLeg, bodyB: this.rLowerLeg, pointA: { x: 0, y: 10 }, pointB: { x: 0, y: -9 }, stiffness: 0.7, render: { visible: false } })
        ];

        // ACOPLAMENTO REALISTA DE ARMA NO BRAÇO ATIVO
        this.weapon = window.WeaponFactory.create(engine, x + (24 * this.facing), y - 10, weaponType);
        this.weapon.owner = this;
        const mainHand = this.facing === 1 ? this.rLowerArm : this.lLowerArm;
        
        this.handJoint = Constraint.create({
            bodyA: mainHand, bodyB: this.weapon,
            pointA: { x: 0, y: 8 }, pointB: { x: -this.weapon.gameConfig.length / 3, y: 0 },
            stiffness: 0.9, length: 1, render: { visible: false }
        });

        this.composite = Composite.create();
        Composite.add(this.composite, [...this.parts, ...this.joints, this.weapon, this.handJoint]);
        Composite.add(engine.world, this.composite);
    }

    move(dir) {
        if (!this.alive) return;
        this.facing = dir;
        Matter.Body.setVelocity(this.chest, { x: dir * 4.2, y: this.chest.velocity.y });
    }

    jump() {
        if (!this.alive) return;
        // Verifica se está tocando o chão pelas pernas para pular, eliminando bug de pulo infinito no ar
        if (Math.abs(this.bacia.velocity.y) < 0.5) {
            Matter.Body.setVelocity(this.chest, { x: this.chest.velocity.x, y: -9.0 });
        }
    }

    attack(forceSign) {
        if (!this.alive) return;
        const config = this.weapon.gameConfig;
        
        if (config.type === "ranged" || config.type === "throwable") {
            if (!this.lastShot || Date.now() - this.lastShot > 500) {
                window.GameEngine.fireProjectile(this, config);
                this.lastShot = Date.now();
                Matter.Body.applyForce(this.chest, this.chest.position, { x: -this.facing * (config.recoil * 0.0015), y: -0.001 });
            }
        } else {
            // Golpe físico realístico baseado em rotação angular violenta
            Matter.Body.setAngularVelocity(this.weapon, forceSign * 0.45);
        }
    }

    takeDamage(amount, attackerBody) {
        if (!this.alive) return;
        this.hp -= amount;
        
        if (attackerBody) {
            // Impacto físico real empurrando o corpo de acordo com a pancada
            const forceDir = (this.chest.position.x - attackerBody.position.x) > 0 ? 1 : -1;
            Matter.Body.applyForce(this.chest, this.chest.position, { x: forceDir * 0.006, y: -0.003 });
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        
        // Desarticula totalmente as travas das juntas (Efeito Boneco de Pano Morto Real)
        Matter.Composite.remove(this.engine.world, this.handJoint);
        this.joints.forEach(j => Matter.Composite.remove(this.engine.world, j));

        // Força de dispersão dos membros
        this.parts.forEach(b => {
            Matter.Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.012, y: -0.015 });
        });

        setTimeout(() => {
            window.GameEngine.endMatch(this.isPlayer2 ? "JOGADOR 1 VENCEU!" : "PLAYER 2 / BOT VENCEU!");
        }, 2000);
    }

    draw(ctx) {
        // ARTE ORIGINAL FLUIDA EM CANVAS (SEM RETÂNGULOS FEIOS)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.fillStyle = this.color;

        // Cabeça
        ctx.beginPath();
        ctx.arc(this.head.position.x, this.head.position.y, 11, 0, Math.PI * 2);
        ctx.fill();

        // Tronco e Bacia
        ctx.beginPath();
        ctx.moveTo(this.head.position.x, this.head.position.y + 11);
        ctx.lineTo(this.chest.position.x, this.chest.position.y);
        ctx.lineTo(this.bacia.position.x, this.bacia.position.y);
        ctx.stroke();

        // Braços
        ctx.beginPath();
        ctx.moveTo(this.chest.position.x, this.chest.position.y - 6);
        ctx.lineTo(this.lUpperArm.position.x, this.lUpperArm.position.y);
        ctx.lineTo(this.lLowerArm.position.x, this.lLowerArm.position.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.chest.position.x, this.chest.position.y - 6);
        ctx.lineTo(this.rUpperArm.position.x, this.rUpperArm.position.y);
        ctx.lineTo(this.rLowerArm.position.x, this.rLowerArm.position.y);
        ctx.stroke();

        // Pernas
        ctx.beginPath();
        ctx.moveTo(this.bacia.position.x, this.bacia.position.y);
        ctx.lineTo(this.lUpperLeg.position.x, this.lUpperLeg.position.y);
        ctx.lineTo(this.lLowerLeg.position.x, this.lLowerLeg.position.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.bacia.position.x, this.bacia.position.y);
        ctx.lineTo(this.rUpperLeg.position.x, this.rUpperLeg.position.y);
        ctx.lineTo(this.rLowerLeg.position.x, this.rLowerLeg.position.y);
        ctx.stroke();

        // ARTE DAS ARMAS REALISTAS DETALHADAS
        const config = this.weapon.gameConfig;
        ctx.save();
        ctx.translate(this.weapon.position.x, this.weapon.position.y);
        ctx.rotate(this.weapon.angle);
        
        ctx.fillStyle = config.type === "ranged" ? "#334155" : "#475569"; // Cabo / Coronha
        ctx.fillRect(-config.length/2, -config.thickness/2, config.length/4, config.thickness);
        
        ctx.fillStyle = config.color; // Lâmina ou Cano Principal Metálico
        ctx.fillRect(-config.length/4, -config.thickness/2, config.length * 0.75, config.thickness);
        ctx.restore();
    }
}
