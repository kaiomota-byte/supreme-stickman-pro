export const WeaponFactory = {
    types: {
        // --- Combate Corporal (Melee) ---
        sword: { name: "Espada", length: 65, thickness: 5, weight: 1.0, damage: 15, color: "#cbd5e1", type: "melee" },
        katana: { name: "Katana", length: 72, thickness: 4, weight: 0.7, damage: 22, color: "#f8fafc", type: "melee" },
        machado: { name: "Machado", length: 58, thickness: 12, weight: 2.2, damage: 32, color: "#94a3b8", type: "melee" },
        martelo: { name: "Martelo", length: 55, thickness: 16, weight: 3.5, damage: 42, color: "#475569", type: "melee" },
        motosserra: { name: "Motosserra", length: 70, thickness: 12, weight: 2.5, damage: 48, color: "#ef4444", type: "melee" },
        bastao_eletrico: { name: "Bastão", length: 65, thickness: 6, weight: 0.9, damage: 16, color: "#3b82f6", type: "melee" },
        
        // --- Disparos Físicos (Ranged) ---
        pistola: { name: "Pistola", length: 25, thickness: 7, weight: 0.8, damage: 18, color: "#64748b", type: "ranged", recoil: 1.5 },
        revolver: { name: "Revólver", length: 26, thickness: 8, weight: 1.0, damage: 26, color: "#94a3b8", type: "ranged", recoil: 3.5 },
        escopeta: { name: "Escopeta", length: 50, thickness: 10, weight: 2.5, damage: 45, color: "#1e293b", type: "ranged", recoil: 8.0 },
        rifle: { name: "Rifle", length: 60, thickness: 8, weight: 2.8, damage: 20, color: "#0f172a", type: "ranged", recoil: 2.5 },
        sniper: { name: "Sniper", length: 80, thickness: 9, weight: 5.0, damage: 85, color: "#020617", type: "ranged", recoil: 12.0 },
        lança_foguetes: { name: "RPG", length: 75, thickness: 14, weight: 6.0, damage: 95, color: "#16a34a", type: "ranged", recoil: 16.0 },
        
        // --- Tecnologia Futurista Sci-Fi ---
        laser_rifle: { name: "Rifle Plasma", length: 60, thickness: 10, weight: 1.4, damage: 35, color: "#06b6d4", type: "ranged", recoil: 0.8 },
        canhao_orbitais: { name: "Canhão", length: 70, thickness: 14, weight: 3.5, damage: 120, color: "#ec4899", type: "ranged", recoil: 20.0 }
    },

    create(engine, x, y, type) {
        const config = this.types[type] || this.types.sword;
        
        // Criando o corpo físico da arma
        const b = Matter.Bodies.rectangle(x, y, config.length, config.thickness, {
            density: 0.0008 * config.weight, 
            friction: 0.2,
            frictionAir: 0.05, // Amortecimento para desacelerar giros brutos automaticamente
            label: "weapon"
        });

        // REFORÇO DE INÉRCIA: Aumentamos a resistência mecânica ao giro. 
        // Isso impede o bug do boneco girar infinitamente ao empunhar a motosserra!
        Matter.Body.setInertia(b, b.inertia * 5.0);
        
        b.gameConfig = config;
        return b;
    }
};
