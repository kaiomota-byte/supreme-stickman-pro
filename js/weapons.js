export const WeaponFactory = {
    types: {
        sword: { name: "Espada de Aço", length: 70, thickness: 8, weight: 1.2, damage: 15, color: "#d1d1d6", type: "melee" },
        katana: { name: "Katana Ornamental", length: 80, thickness: 5, weight: 0.9, damage: 22, color: "#e5e5ea", type: "melee" },
        hammer: { name: "Martelo de Guerra", length: 55, thickness: 22, weight: 4.5, damage: 40, color: "#8e8e93", type: "melee" },
        scythe: { name: "Foice Sombria", length: 90, thickness: 10, weight: 2.0, damage: 30, color: "#3a3a3c", type: "melee" },
        laser: { name: "Rifle de Plasma", length: 60, thickness: 12, weight: 1.5, damage: 25, color: "#007aff", type: "ranged", recoil: 4 }
    },

    create(engine, x, y, type) {
        const { Bodies, Body } = Matter;
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
