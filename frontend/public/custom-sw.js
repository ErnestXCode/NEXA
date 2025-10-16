/// <reference lib="webworker" />

/* eslint-env worker */


// ✅ Use Workbox from CDN (no build step required)
self.importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

if (self.workbox) {
  console.log("✅ Workbox loaded successfully");

  self.skipWaiting();
  self.workbox.core.clientsClaim();
  self.workbox.precaching.cleanupOutdatedCaches();
  self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Always fetch the latest for HTML pages (app shell)
  self.workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new self.workbox.strategies.CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new self.workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      }),
    ],
  })
);


  // For static assets (JS/CSS), keep precache
  self.workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "script" || request.destination === "style",
    new self.workbox.strategies.StaleWhileRevalidate({
      cacheName: "static-resources",
    })
  );
} else {
  console.error("❌ Workbox failed to load");
}

// 🔔 Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Nexa Notification";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge/icon-72x72.png",
    data: data.url || "/dashboard/communication",
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);

      // Badge (optional)
      if ("setAppBadge" in navigator) {
        const prev = self.unreadCount || 0;
        self.unreadCount = prev + 1;
        try {
          navigator.setAppBadge(self.unreadCount);
        } catch (err) {
          console.error("App badge failed:", err);
        }
      }

      // Notify open tabs
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      clients.forEach((client) =>
        client.postMessage({ type: "NEW_MESSAGE", payload: data })
      );
    })()
  );
});

// 🔗 Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data;
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
