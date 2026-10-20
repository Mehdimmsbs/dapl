const CACHE_NAME = "dapl-offline-v2";

const OFFLINE_PAGES = new Set([
  "/",
  "/calendar",
  "/routines",
  "/settings",
  "/welcome",
  "/welcome/guide",
]);

const CACHEABLE_DESTINATIONS = new Set([
  "image",
  "font",
  "script",
  "style",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (name) => name.startsWith("dapl-") && name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      );

      await self.clients.claim();
    })(),
  );
});

/* Stores visited public pages and application assets for offline use. */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  /* Next.js navigation payloads must not share the HTML cache. */
  if (
    request.headers.get("rsc") === "1" ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  const isPage =
    request.mode === "navigate" &&
    OFFLINE_PAGES.has(url.pathname) &&
    !url.search;

  const isAsset =
    CACHEABLE_DESTINATIONS.has(request.destination) &&
    (
      url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/")
    );

  if (!isPage && !isAsset) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      let response;

      try {
        response = await fetch(request);
      } catch {
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response(
          "This page or asset is not available offline yet.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
            },
          },
        );
      }

      const validPage =
        !isPage ||
        response.headers.get("content-type")?.includes("text/html");

      if (response.ok && !response.redirected && validPage) {
        try {
          await cache.put(request, response.clone());
        } catch (error) {
          /* A storage failure must not prevent the online response. */
          console.warn("Offline cache write failed:", error);
        }
      }

      return response;
    })(),
  );
});

/* Opens the planner when a notification is selected. */
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
          const navigatedClient = await client.navigate(target);

          await (navigatedClient ?? client).focus();
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
        const payload = event.data?.json();

        if (
          payload &&
          typeof payload === "object" &&
          !Array.isArray(payload)
        ) {
          message = payload;
        }
      } catch {
        /* A malformed payload still produces a visible notification. */
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