import { WeaponFactory } from './weapons.js'; // Ajuste o caminho se seu arquivo de armas tiver outro nome

export class StickmanRagdoll {
    constructor(engine, x, y, color, weaponType, isPlayer2 = false) {
        this.engine = engine;
        this.color = color;
        this.hp = 100;
        this.alive = true;
        this.facing = isPlayer2 ? -1 : 1;
        this.isPlayer2 = isPlayer2;
        this.lastShot = 0;

        const { Bodies, Constraint, Composite, Body } = Matter;
        // Cria um grupo de colisão isolado para o próprio boneco não se espancar sozinho
        const group = Body.nextGroup ? Body.nextGroup(true) : -1;

        // Propriedades físicas equilibradas: mais peso e mais atrito com o ar (frictionAir) para ritmar o movimento
        const physOptions = { 
            collisionFilter: { group: group }, 
            friction: 0.3, 
            frictionAir: 0.08, 
            density: 0.0015 
        };

        // Membros do Corpo
        this.head = Bodies.circle(x, y - 45, 11, physOptions);
        this.chest = Bodies.rectangle(x, y - 18, 12, 24, physOptions);
        this.bacia = Bodies.rectangle(x, y + 8, 12, 16, physOptions);
        
        this.lArm = Bodies.rectangle(x - 14, y - 10, 6, 26, physOptions);
        this.rArm = Bodies.rectangle(x + 14, y - 10, 6, 26, physOptions);
        this.lLeg = Bodies.rectangle(x - 6, y + 28, 6, 28, physOptions);
        this.rLeg = Bodies.rectangle(x + 6, y + 28, 6, 28, physOptions);

        this.parts = [this.head, this.chest, this.bacia, this.lArm, this.rArm, this.lLeg, this.rLeg];
        
        // Tags de identificação para o motor de colisão saber quem é quem
        this.parts.forEach(p => { 
            p.isStickmanPart = true; 
            p.owner = this; 
            p.label = "player_body"; 
        });

        // JUNTAS REFORÇADAS: stiffness alto (0.95) mantém a espinha ereta e firme!
        this.joints = [
            Constraint.create({ bodyA: this.head, bodyB: this.chest, pointA: { x: 0, y: 11 }, pointB: { x: 0, y: -13 }, stiffness: 0.95, render: { visible: false } }),
            Constraint.create({ bodyA: this.chest, bodyB: this.bacia, pointA: { x: 0, y: 12 }, pointB: { x: 0, y: -9 }, stiffness: 0.95, render: { visible: false } }),
            Constraint.create({ bodyA: this.chest, bodyB: this.lArm, pointA: { x: -7, y: -8 }, pointB: { x: 0, y: -11 }, stiffness: 0.85, render: { visible: false } }),
            Constraint.create({ bodyA: this.chest, bodyB: this.rArm, pointA: { x: 7, y: -8 }, pointB: { x: 0, y: -11 }, stiffness: 0.85, render: { visible: false } }),
            Constraint.create({ bodyA: this.bacia, bodyB: this.lLeg, pointA: { x: -4, y: 8 }, pointB: { x: 0, y: -12 }, stiffness: 0.85, render: { visible: false } }),
            Constraint.create({ bodyA: this.bacia, bodyB: this.rLeg, pointA: { x: 4, y: 8 }, pointB: { x: 0, y: -12 }, stiffness: 0.85, render: { visible: false } })
        ];

        // GERAÇÃO DA ARMA
        this.weapon = WeaponFactory.create(engine, x + (25 * this.facing), y - 15, weaponType);
        this.weapon.owner = this;
        
        // EMPUNHADURA CORRIGIDA: Prende a mão do boneco na ponta traseira da arma (o cabo), não no meio!
        this.handJoint = Constraint.create({
            bodyA: this.rArm, 
            bodyB: this.weapon,
            pointA: { x: 0, y: 10 }, 
            pointB: { x: -this.weapon.gameConfig.length / 2, y: 0 },
            stiffness: 0.95, 
            length: 1,
            render: { visible: false }
        });

        Composite.add(engine.world, [...this.parts, ...this.joints, this.weapon, this.handJoint]);
    }

    move(dir) {
        if (!this.alive) return;
        this.facing = dir;
        // Passos cadenciados e firmes
        Matter.Body.setVelocity(this.chest, { x: dir * 3.2, y: this.chest.velocity.y });
    }

    jump() {
        if (!this.alive) return;
        // Só pula se estiver com os pés firmes (estabilidade vertical próxima de zero)
        if (Math.abs(this.bacia.velocity.y) < 0.4) {
            Matter.Body.setVelocity(this.chest, { x: this.chest.velocity.x, y: -7.5 });
        }
    }

    attack(forceSign) {
        if (!this.alive) return;
        const config = this.weapon.gameConfig;
        
        if (config.type === "ranged") {
            // Controle de cadência de tiro (500ms)
            if (Date.now() - this.lastShot > 500) {
                // O disparo será gerenciado pela Engine principal
                if (window.GameEngine) window.GameEngine.fireProjectile(this, config);
                this.lastShot = Date.now();
                // Força de recuo baseada no peso da arma de fogo
                Matter.Body.applyForce(this.chest, this.chest.position, { 
                    x: -this.facing * (config.recoil * 0.0008), 
                    y: -0.0005 
                });
            }
        } else {
            // Limita o giro de armas brancas pesadas como a motosserra para não dar o efeito hélice
            let targetVelocity = forceSign * 0.25;
            if (config.name === "Motosserra") targetVelocity = forceSign * 0.12; 
            
            Matter.Body.setAngularVelocity(this.weapon, targetVelocity);
        }
    }

    takeDamage(amount, attackerBody) {
        if (!this.alive) return;
        this.hp -= amount;
        
        // Empurrão de impacto (Knockback) ao tomar dano
        if (attackerBody) {
            const push = (this.chest.position.x - attackerBody.position.x) > 0 ? 1 : -1;
            Matter.Body.applyForce(this.chest, this.chest.position, { x: push * 0.003, y: -0.0015 });
        }

        if (this.hp <= 0) { 
            this.hp = 0; 
            this.die(); 
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        
        // Desarticulação total do Ragdoll na morte
        Matter.Composite.remove(this.engine.world, this.handJoint);
        this.joints.forEach(j => Matter.Composite.remove(this.engine.world, j));
        
        this.parts.forEach(b => {
            Matter.Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.005, y: -0.005 });
        });

        setTimeout(() => {
            if (window.GameEngine) {
                window.GameEngine.endMatch(this.isPlayer2 ? "VITÓRIA DO JOGADOR 1!" : "O BOT VENCEU A RODADA!");
            }
        }, 2000);
    }

    draw(ctx) {
        ctx.strokeStyle = this.color; 
        ctx.lineWidth = 4.5; 
        ctx.lineCap = "round"; 
        ctx.fillStyle = this.color;

        // Desenho do Esqueleto do Stickman
        ctx.beginPath(); ctx.arc(this.head.position.x, this.head.position.y, 11, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(this.head.position.x, this.head.position.y + 11);
        ctx.lineTo(this.chest.position.x, this.chest.position.y);
        ctx.lineTo(this.bacia.position.x, this.bacia.position.y); ctx.stroke();

        ctx.beginPath(); ctx.moveTo(this.chest.position.x, this.chest.position.y - 4); ctx.lineTo(this.lArm.position.x, this.lArm.position.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.chest.position.x, this.chest.position.y - 4); ctx.lineTo(this.rArm.position.x, this.rArm.position.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.bacia.position.x, this.bacia.position.y); ctx.lineTo(this.lLeg.position.x, this.lLeg.position.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.bacia.position.x, this.bacia.position.y); ctx.lineTo(this.rLeg.position.x, this.rLeg.position.y); ctx.stroke();

        // SPRITES VETORIAIS MELHORADOS PARA AS ARMAS
        const config = this.weapon.gameConfig;
        ctx.save();
        ctx.translate(this.weapon.position.x, this.weapon.position.y);
        ctx.rotate(this.weapon.angle);
        
        if (config.type === "ranged") {
            // Corpo traseiro / Cabo da arma de fogo
            ctx.fillStyle = "#1e1b4b"; 
            ctx.fillRect(0, -config.thickness/2, config.length * 0.25, config.thickness * 1.5); 
            // Cano metálico
            ctx.fillStyle = config.color; 
            ctx.fillRect(config.length * 0.25, -config.thickness/2, config.length * 0.75, config.thickness); 
            // Ponto laser de mira
            ctx.fillStyle = "#ef4444"; 
            ctx.fillRect(config.length * 0.4, -config.thickness, 6, 3); 
        } else {
            // Cabo de madeira/couro das armas brancas
            ctx.fillStyle = "#451a03"; 
            ctx.fillRect(0, -config.thickness/2, config.length * 0.2, config.thickness); 
            // Lâmina/Metal principal
            ctx.fillStyle = config.color; 
            ctx.fillRect(config.length * 0.2, -config.thickness/2, config.length * 0.8, config.thickness); 
            
            if (config.name === "Motosserra") {
                // Bloco do motor industrial
                ctx.fillStyle = "#b91c1c"; 
                ctx.fillRect(config.length * 0.2, -config.thickness * 1.2, config.length * 0.3, config.thickness * 2.4); 
                // Linhas simulando dentes da corrente
                ctx.strokeStyle = "#fff"; 
                ctx.lineWidth = 1.5; 
                ctx.beginPath(); 
                ctx.strokeRect(config.length * 0.5, -config.thickness/2, config.length * 0.5, config.thickness);
            }
        }
        ctx.restore();
    }
}
