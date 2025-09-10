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
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: data.url || "/dashboard/communication",
  };
  event.waitUntil(self.registration.showNotification(title, options));
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

