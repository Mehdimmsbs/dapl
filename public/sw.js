const CACHE_NAME = "dapl-assets-v1";

const CACHEABLE_DESTINATIONS = new Set([
    "image",
    "font",
]);

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter(
                            (cacheName) =>
                                cacheName.startsWith("dapl-") &&
                                cacheName !== CACHE_NAME,
                        )
                        .map((cacheName) =>
                            caches.delete(cacheName),
                        ),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (
        request.method !== "GET" ||
        !CACHEABLE_DESTINATIONS.has(
            request.destination,
        )
    ) {
        return;
    }

    const requestUrl = new URL(request.url);

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                if (!response || !response.ok) {
                    return response;
                }

                const responseCopy = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseCopy);
                });

                return response;
            });
        }),
    );
});