const CACHE_NAME = "al-basem-delivery-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./poster.jpg",
    "./basem.jpg",
    "./manifest.json"
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية بالكاش
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// تفعيل النسخة الجديدة وحذف أي كاش قديم
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

// إدارة طلبات الملفات
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }

    // استثناء ملف status.json لجلبه مباشرة من النت بدون تخزين كاش
    if (event.request.url.includes("status.json")) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // باقي ملفات الكرت: تحديث الكاش والعمل بدون إنترنت
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