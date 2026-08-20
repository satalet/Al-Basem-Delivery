const CACHE_NAME = "al-basem-delivery-v5";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./poster.jpg",
    "./basem.jpg",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png",
    "./favicon-32x32.png",
    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }

    // استثناء رابط الحالة من الكاش لجلبه لحظياً من النت
    if (event.request.url.includes("api.jsonbin.io")) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});