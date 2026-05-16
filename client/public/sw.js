const CACHE_NAME = 'promosecure-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    // We cache standard react app paths
    '/src/main.jsx',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only intercept GET requests
    if (event.request.method !== 'GET') return;
    
    // Don't intercept API requests, let them fail naturally so our app logic handles offline
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request).then((response) => {
            // Cache successful responses for future offline use
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            
            // Clone response since it's a stream and can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME).then((cache) => {
                // Don't cache chrome-extension or other non-http requests
                if (event.request.url.startsWith('http')) {
                    cache.put(event.request, responseToCache);
                }
            });
            
            return response;
        }).catch(() => {
            // If network fails, look in cache
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                // If it's a navigation request and not in cache, return index.html for SPA routing
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
