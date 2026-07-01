export const MapManager = {
    maps: {
        arena: { name: "Arena Clássica", platforms: [{ x: 640, y: 650, w: 1280, h: 60, static: true, color: '#2c2c35' }] },
        lava: { 
            name: "Inferno de Lava", 
            gravity: 0.6,
            platforms: [
                { x: 300, y: 450, w: 350, h: 30, static: true, color: '#3a3a3c' },
                { x: 980, y: 450, w: 350, h: 30, static: true, color: '#3a3a3c' }
            ],
            hazards: [{ x: 640, y: 710, w: 1280, h: 40, type: "lava", color: '#ff3b30' }]
        },
        esteiras: {
            name: "Fábrica de Esteiras",
            platforms: [
                { x: 640, y: 550, w: 600, h: 30, static: true, speed: 3.5, color: '#ffcc00' },
                { x: 640, y: 300, w: 400, h: 30, static: true, speed: -3.5, color: '#ffcc00' }
            ]
        },
        espaco: {
            name: "Gravidade Zero Lunar",
            gravity: 0.1,
            platforms: [
                { x: 200, y: 600, w: 300, h: 20, static: true, color: '#545456' },
                { x: 1080, y: 600, w: 300, h: 20, static: true, color: '#545456' },
                { x: 640, y: 400, w: 200, h: 20, static: true, color: '#007aff' } // Plataforma pula-pula
            ]
        }
    },

    load(engine, mapName) {
        const { Bodies, Composite } = Matter;
        const currentMap = this.maps[mapName] || this.maps.arena;
        
        engine.gravity.y = currentMap.gravity !== undefined ? currentMap.gravity : 0.6;

        currentMap.platforms.forEach(plat => {
            const body = Bodies.rectangle(plat.x, plat.y, plat.w, plat.h, {
                isStatic: plat.static,
                label: plat.speed ? "conveyor" : "ground",
                render: { fillStyle: plat.color }
            });
            if (plat.speed) body.speedValue = plat.speed;
            Composite.add(engine.world, body);
        });

        if (currentMap.hazards) {
            currentMap.hazards.forEach(haz => {
                const body = Bodies.rectangle(haz.x, haz.y, haz.w, haz.h, {
                    isStatic: true,
                    isSensor: true,
                    label: haz.type,
                    render: { fillStyle: haz.color }
                });
                Composite.add(engine.world, body);
            });
        }
    }
};
