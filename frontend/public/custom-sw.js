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

  event.waitUntil(
    (async () => {
      // Show system notification
      await self.registration.showNotification(title, options);

      // // Update the app icon badge (Badging API)
      if ("setAppBadge" in navigator) {
        const prev = self.unreadCount || 0;
        self.unreadCount = prev + 1;
        try {
          navigator.setAppBadge(self.unreadCount);
        } catch (err) {
          console.error("App badge failed:", err);
        }
      }

      // Notify any open clients
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({ type: "NEW_MESSAGE", payload: data });
      });
    })()
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
