/** POS-only service worker: cache shell + static assets for best-effort offline reopen */

const CACHE = "sohoj-pos-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never cache API
  if (url.pathname.startsWith("/api")) return;

  const isPosNav =
    req.mode === "navigate" &&
    (url.pathname === "/pos" || url.pathname.startsWith("/pos/"));

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:js|css|woff2|png|svg|ico|webp)$/i.test(url.pathname);

  if (!isPosNav && !isStatic) return;

  event.respondWith(
    (async () => {
      try {
        const network = await fetch(req);
        if (network && network.ok) {
          const cache = await caches.open(CACHE);
          void cache.put(req, network.clone());
        }
        return network;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (isPosNav) {
          const fallback = await caches.match("/pos");
          if (fallback) return fallback;
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain" },
        });
      }
    })()
  );
});
