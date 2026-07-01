export const WeaponFactory = {
    types: {
        // CORPO A CORPO (MELEE)
        sword: { name: "Espada de Aço", length: 70, thickness: 8, weight: 1.2, damage: 15, color: "#d1d1d6", type: "melee", durability: 100 },
        katana: { name: "Katana Ornamental", length: 80, thickness: 5, weight: 0.9, damage: 22, color: "#ffffff", type: "melee", durability: 80 },
        machado: { name: "Machado de Batalha", length: 65, thickness: 14, weight: 2.5, damage: 30, color: "#8e8e93", type: "melee", durability: 120 },
        lanca: { name: "Lança Longa", length: 110, thickness: 6, weight: 1.4, damage: 18, color: "#ff9500", type: "melee", durability: 90 },
        martelo: { name: "Martelo de Guerra", length: 55, thickness: 22, weight: 4.5, damage: 40, color: "#545456", type: "melee", durability: 200 },
        foice: { name: "Foice Sombria", length: 90, thickness: 10, weight: 2.0, damage: 35, color: "#1c1c1e", type: "melee", durability: 110 },
        tridente: { name: "Tridente Imperial", length: 105, thickness: 7, weight: 1.6, damage: 20, color: "#34c759", type: "melee", durability: 100 },
        faca: { name: "Faca de Combate", length: 40, thickness: 5, weight: 0.5, damage: 12, color: "#aeaeb2", type: "melee", durability: 70 },
        clava: { name: "Clava de Espinhos", length: 65, thickness: 16, weight: 3.0, damage: 28, color: "#636366", type: "melee", durability: 150 },
        motosserra: { name: "Motosserra Infernal", length: 75, thickness: 15, weight: 3.8, damage: 45, color: "#ff3b30", type: "melee", durability: 140 },
        bastao_eletrico: { name: "Bastão de Choque", length: 70, thickness: 8, weight: 1.1, damage: 16, color: "#007aff", type: "melee", durability: 95 },

        // DISTÂNCIA / PROJÉTEIS (RANGED)
        arco: { name: "Arco Longo", length: 50, thickness: 6, weight: 0.8, damage: 14, color: "#af52de", type: "ranged", recoil: 1, ammo: "flecha" },
        besta: { name: "Besta Pesada", length: 45, thickness: 10, weight: 2.1, damage: 25, color: "#5856d6", type: "ranged", recoil: 3, ammo: "virote" },
        pistola: { name: "Pistola 9mm", length: 30, thickness: 8, weight: 1.0, damage: 18, color: "#8e8e93", type: "ranged", recoil: 2, ammo: "bala" },
        revolver: { name: "Revólver .38", length: 32, thickness: 9, weight: 1.3, damage: 26, color: "#bcbcc1", type: "ranged", recoil: 5, ammo: "bala" },
        escopeta: { name: "Escopeta Calibre 12", length: 55, thickness: 12, weight: 3.2, damage: 45, color: "#48484a", type: "ranged", recoil: 9, ammo: "chumbo" },
        rifle: { name: "Rilfe de Assalto", length: 65, thickness: 10, weight: 3.6, damage: 22, color: "#2c2c2e", type: "ranged", recoil: 3, ammo: "bala" },
        sniper: { name: "Rifle de Precisão", length: 85, thickness: 11, weight: 6.5, damage: 80, color: "#1c1c1e", type: "ranged", recoil: 12, ammo: "bala_pesada" },
        metralhadora: { name: "Metralhadora Leve", length: 70, thickness: 14, weight: 7.2, damage: 19, color: "#3a3a3c", type: "ranged", recoil: 2, ammo: "bala" },
        lança_foguetes: { name: "RPG-7", length: 80, thickness: 18, weight: 8.0, damage: 95, color: "#34c759", type: "ranged", recoil: 15, ammo: "foguete" },
        shuriken: { name: "Shuriken Ninja", length: 20, thickness: 4, weight: 0.2, damage: 10, color: "#aeaeb2", type: "throwable", ammo: "item" },
        granada: { name: "Granada Fragmentária", length: 15, thickness: 15, weight: 0.4, damage: 70, color: "#4cd964", type: "throwable", ammo: "explosivo" },
        bomba: { name: "Bomba Clássica", length: 25, thickness: 25, weight: 1.5, damage: 85, color: "#000000", type: "throwable", ammo: "explosivo" },

        // ARMAS FUTURISTAS
        laser_rifle: { name: "Rifle de Plasma", length: 65, thickness: 12, weight: 1.8, damage: 35, color: "#007aff", type: "ranged", recoil: 1, ammo: "plasma" },
        canhao_orbitais: { name: "Canhão Desintegrador", length: 75, thickness: 20, weight: 4.0, damage: 120, color: "#ff2d55", type: "ranged", recoil: 20, ammo: "anti-materia" }
    },

    create(engine, x, y, type) {
        const { Bodies } = Matter;
        const config = this.types[type] || this.types.sword;

        const weaponBody = Bodies.rectangle(x, y, config.length, config.thickness, {
            density: 0.001 * config.weight,
            friction: 0.1,
            label: "weapon",
            render: { fillStyle: config.color }
        });

        weaponBody.gameConfig = config;
        return weaponBody;
    }
};
