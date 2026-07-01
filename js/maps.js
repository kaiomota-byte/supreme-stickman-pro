export const MapManager = {
    maps: {
        arena: { name: "Arena Clássica", platforms: [{ x: 640, y: 660, w: 1280, h: 50, color: '#1e293b', isStatic: true }] },
        lava: { 
            name: "Fábrica de Lava", 
            gravity: 0.65,
            platforms: [
                { x: 280, y: 480, w: 320, h: 25, color: '#334155', isStatic: true },
                { x: 1000, y: 480, w: 320, h: 25, color: '#334155', isStatic: true },
                { x: 640, y: 320, w: 250, h: 25, color: '#475569', isStatic: true }
            ],
            hazards: [{ x: 640, y: 710, w: 1280, h: 30, type: "lava", color: '#ef4444' }]
        },
        esteiras: {
            name: "Fábrica Automação",
            platforms: [
                { x: 640, y: 560, w: 700, h: 30, color: '#eab308', isStatic: true, speed: 3.0 },
                { x: 640, y: 340, w: 450, h: 30, color: '#eab308', isStatic: true, speed: -3.0 }
            ]
        },
        espaco: {
            name: "Gravidade Lunar Zero",
            gravity: 0.12,
            platforms: [
                { x: 300, y: 600, w: 400, h: 20, color: '#64748b', isStatic: true },
                { x: 980, y: 600, w: 400, h: 20, color: '#64748b', isStatic: true }
            ]
        }
    },

    load(engine, mapName) {
        const { Bodies, Composite } = Matter;
        const currentMap = this.maps[mapName] || this.maps.arena;
        
        engine.gravity.y = currentMap.gravity !== undefined ? currentMap.gravity : 0.6;

        currentMap.platforms.forEach(plat => {
            const b = Bodies.rectangle(plat.x, plat.y, plat.w, plat.h, {
                isStatic: true,
                label: plat.speed ? "conveyor" : "ground",
                render: { visible: false } // Nós desenhamos via loop customizado
            });
            b.mapColor = plat.color;
            b.w = plat.w; b.h = plat.h;
            if (plat.speed) b.speedValue = plat.speed;
            Composite.add(engine.world, b);
        });

        if (currentMap.hazards) {
            currentMap.hazards.forEach(haz => {
                const b = Bodies.rectangle(haz.x, haz.y, haz.w, haz.h, {
                    isStatic: true, isSensor: true, label: haz.type
                });
                b.mapColor = haz.color;
                b.w = haz.w; b.h = haz.h;
                Composite.add(engine.world, b);
            });
        }
        return currentMap;
    }
};
