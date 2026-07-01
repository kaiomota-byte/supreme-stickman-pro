export const MapManager = {
    maps: {
        arena: { name: "Arena Clássica", platforms: [{ x: 640, y: 650, w: 1280, h: 60, static: true }] },
        lava: { 
            name: "Inferno de Lava", 
            platforms: [
                { x: 300, y: 500, w: 400, h: 40, static: true },
                { x: 980, y: 500, w: 400, h: 40, static: true }
            ],
            hazards: [{ x: 640, y: 700, w: 1280, h: 50, type: "lava" }]
        },
        space: {
            name: "Estação Orbital",
            gravity: 0.15,
            platforms: [{ x: 640, y: 600, w: 800, h: 30, static: true }]
        }
    },

    load(engine, mapName) {
        const { Bodies, Composite } = Matter;
        const currentMap = this.maps[mapName] || this.maps.arena;
        
        engine.gravity.y = currentMap.gravity !== undefined ? currentMap.gravity : 0.6;

        currentMap.platforms.forEach(plat => {
            const body = Bodies.rectangle(plat.x, plat.y, plat.w, plat.h, {
                isStatic: plat.static,
                render: { fillStyle: '#2c2c35' }
            });
            Composite.add(engine.world, body);
        });

        if (currentMap.hazards) {
            currentMap.hazards.forEach(haz => {
                const body = Bodies.rectangle(haz.x, haz.y, haz.w, haz.h, {
                    isStatic: true,
                    isSensor: true,
                    label: haz.type,
                    render: { fillStyle: '#ff3b30' }
                });
                Composite.add(engine.world, body);
            });
        }
    }
};
