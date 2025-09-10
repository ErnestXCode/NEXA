/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

clientsClaim();
cleanupOutdatedCaches();

// Precache all Vite-built static files
precacheAndRoute(self.__WB_MANIFEST || []);

// Listen for push events
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Nexa Notification";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge/icon-72x72.png",
    data: data.url || "/dashboard/communication",
  };

  // Show system notification
  event.waitUntil(self.registration.showNotification(title, options));

  // 🔴 Notify any open app windows (React will catch this)
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "NEW_MESSAGE",
          payload: { url: data.url, body: data.body },
        });
      });
    })
  );
});

// Handle notification clicks
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
