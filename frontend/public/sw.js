const CACHE_NAME = "zelvoo-v1";
const OFFLINE_URL = "/offline";

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
];

// ─── Install: precache core assets ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// ─── Activate: clean up old caches ──────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// ─── Fetch: network-first with cache fallback ───────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls and external requests — don't cache them
  if (request.url.includes("/api/") || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.ok && (request.destination === "image" || request.destination === "style" || request.destination === "script" || request.destination === "font")) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Try to serve from cache
        const cached = await caches.match(request);
        if (cached) return cached;

        // For navigation requests, show offline page
        if (request.mode === "navigate") {
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
        }

        // Return a basic offline response
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      })
  );
});

// ─── Push Notification: receive and display ─────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Zelvoo",
      body: event.data.text(),
      icon: "/icons/icon-192x192.svg",
    };
  }

  const options = {
    body: data.body || "You have a new notification",
    icon: data.icon || "/icons/icon-192x192.svg",
    badge: data.badge || "/icons/icon-72x72.svg",
    tag: data.tag || "general",
    vibrate: [100, 50, 100],
    data: {
      url: data.data?.url || "/",
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title || "Zelvoo", options));
});

// ─── Notification Click: open the relevant page ─────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});
