export const Storage = {
    save(data) {
        localStorage.setItem('stickman_evolved_save', JSON.stringify(data));
    },
    load() {
        const local = localStorage.getItem('stickman_evolved_save');
        if (!local) {
            return {
                coins: 100,
                unlockedSkins: ['default'],
                unlockedWeapons: ['sword'],
                highScore: 0
            };
        }
        return JSON.parse(local);
    }
};
