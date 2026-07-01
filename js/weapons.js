export const WeaponFactory = {
    types: {
        sword: { name: "Espada de Aço", length: 72, thickness: 7, weight: 1.2, damage: 16, color: "#cbd5e1", type: "melee" },
        katana: { name: "Katana Ornamental", length: 82, thickness: 5, weight: 0.8, damage: 24, color: "#f8fafc", type: "melee" },
        machado: { name: "Machado de Batalha", length: 65, thickness: 15, weight: 2.8, damage: 34, color: "#94a3b8", type: "melee" },
        lanca: { name: "Lança Longa", length: 115, thickness: 6, weight: 1.4, damage: 18, color: "#f59e0b", type: "melee" },
        martelo: { name: "Martelo de Guerra", length: 55, thickness: 24, weight: 4.8, damage: 45, color: "#475569", type: "melee" },
        foice: { name: "Foice Sombria", length: 92, thickness: 9, weight: 2.2, damage: 38, color: "#1e1b4b", type: "melee" },
        tridente: { name: "Tridente Imperial", length: 105, thickness: 8, weight: 1.8, damage: 22, color: "#10b981", type: "melee" },
        faca: { name: "Faca de Combate", length: 38, thickness: 5, weight: 0.4, damage: 12, color: "#64748b", type: "melee" },
        clava: { name: "Clava de Espinhos", length: 68, thickness: 16, weight: 3.2, damage: 28, color: "#451a03", type: "melee" },
        motosserra: { name: "Motosserra Infernal", length: 76, thickness: 16, weight: 4.0, damage: 50, color: "#ef4444", type: "melee" },
        bastao_eletrico: { name: "Bastão de Choque", length: 70, thickness: 8, weight: 1.1, damage: 15, color: "#3b82f6", type: "melee" },
        
        arco: { name: "Arco Longo", length: 50, thickness: 6, weight: 0.7, damage: 16, color: "#a855f7", type: "ranged", recoil: 1, ammo: "arrow" },
        besta: { name: "Besta Pesada", length: 45, thickness: 10, weight: 2.2, damage: 26, color: "#6366f1", type: "ranged", recoil: 3, ammo: "bolt" },
        pistola: { name: "Pistola 9mm", length: 28, thickness: 8, weight: 1.0, damage: 18, color: "#475569", type: "ranged", recoil: 2, ammo: "bullet" },
        revolver: { name: "Revólver .38", length: 30, thickness: 9, weight: 1.3, damage: 28, color: "#94a3b8", type: "ranged", recoil: 5, ammo: "bullet" },
        escopeta: { name: "Escopeta Calibre 12", length: 58, thickness: 11, weight: 3.4, damage: 48, color: "#1e293b", type: "ranged", recoil: 10, ammo: "buckshot" },
        rifle: { name: "Rifle de Assalto", length: 66, thickness: 9, weight: 3.6, damage: 22, color: "#0f172a", type: "ranged", recoil: 3, ammo: "bullet" },
        sniper: { name: "Rifle de Precisão", length: 88, thickness: 11, weight: 6.8, damage: 85, color: "#020617", type: "ranged", recoil: 14, ammo: "heavy" },
        metralhadora: { name: "Metralhadora Leve", length: 72, thickness: 13, weight: 7.5, damage: 20, color: "#334155", type: "ranged", recoil: 2, ammo: "bullet" },
        lança_foguetes: { name: "RPG-7", length: 82, thickness: 16, weight: 8.2, damage: 95, color: "#16a34a", type: "ranged", recoil: 18, ammo: "rocket" },
        shuriken: { name: "Shuriken Ninja", length: 22, thickness: 4, weight: 0.2, damage: 12, color: "#cbd5e1", type: "throwable" },
        granada: { name: "Granada Fragmentária", length: 16, thickness: 16, weight: 0.4, damage: 75, color: "#22c55e", type: "throwable", ammo: "explosive" },
        bomba: { name: "Bomba Clássica", length: 24, thickness: 24, weight: 1.6, damage: 90, color: "#09090b", type: "throwable", ammo: "explosive" },
        laser_rifle: { name: "Rifle de Plasma", length: 65, thickness: 12, weight: 1.7, damage: 36, color: "#06b6d4", type: "ranged", recoil: 1, ammo: "plasma" },
        canhao_orbitais: { name: "Canhão Desintegrador", length: 78, thickness: 18, weight: 4.2, damage: 120, color: "#ec4899", type: "ranged", recoil: 22, ammo: "plasma_heavy" }
    },

    create(engine, x, y, type) {
        const { Bodies } = Matter;
        const config = this.types[type] || this.types.sword;
        const weaponBody = Bodies.rectangle(x, y, config.length, config.thickness, {
            density: 0.0012 * config.weight, friction: 0.1, label: "weapon"
        });
        weaponBody.gameConfig = config;
        return weaponBody;
    }
};
