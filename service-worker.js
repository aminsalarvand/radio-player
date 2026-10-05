const CACHE_NAME = "player-v8";

const urlsToCache = [
    "./",
    "./index.html",
    "./config.js",

    "./css/style.css",
    "./css/ai.css",
    "./css/animate.css",
    "./css/font-awesome.min.css",

    "./js/script.js",

    "./img/cover.png",
    "./img/fondito.png",
    "./img/radiosnet.png",

    "./manifest.json"
];

/* Install service worker */
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return Promise.all(
                urlsToCache.map(function (url) {
                    return cache.add(url).catch(function (error) {
                        console.warn("Cache skipped:", url, error);
                    });
                })
            );
        })
    );

    self.skipWaiting();
});

/* Activate service worker */
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

/* Handle requests */
self.addEventListener("fetch", function (event) {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    /* Ignore external resources and radio streams */
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(request).catch(function () {
            return caches.match(request).then(function (cachedResponse) {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return new Response(
                    "Resource unavailable",
                    {
                        status: 503,
                        statusText: "Service Unavailable"
                    }
                );
            });
        })
    );
});