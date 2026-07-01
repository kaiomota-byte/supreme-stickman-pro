const CACHE_NAME = 'stickman-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/game.js',
  './js/engine.js',
  './js/menu.js',
  './js/player.js',
  './js/weapons.js',
  './js/maps.js',
  './js/ai.js',
  './js/storage.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(response => response || fetch(e.request)));
});