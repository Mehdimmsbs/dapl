const CACHE_NAME = "dapl-assets-v1";

const CACHEABLE_DESTINATIONS = new Set(["image", "font"]);

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
                cacheName.startsWith("dapl-") && cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (
    request.method !== "GET" ||
    !CACHEABLE_DESTINATIONS.has(request.destination)
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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const target = new URL("/", self.location.origin).href;
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.navigate(target);
          await client.focus();
          return;
        }
      }

      await self.clients.openWindow(target);
    })(),
  );
});
/* Displays notifications received from the push service. */
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let message = {};

      try {
        message = event.data?.json() ?? {};
      } catch {
        // A malformed payload still produces a visible notification.
      }

      await self.registration.showNotification(
        typeof message.title === "string" ? message.title : "My Day",
        {
          body: typeof message.body === "string" ? message.body : "",
          icon: "/icons/my-day-logo.png",
          tag:
            typeof message.tag === "string"
              ? message.tag
              : `dapl-push-${Date.now()}`,
          lang: typeof message.locale === "string" ? message.locale : "en",
          dir: message.direction === "rtl" ? "rtl" : "ltr",
        },
      );
    })(),
  );
});
