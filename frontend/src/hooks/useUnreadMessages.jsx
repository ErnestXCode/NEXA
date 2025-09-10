// src/hooks/useUnreadMessages.js
import { useEffect, useState } from "react";

export default function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handler = (event) => {
        if (event.data?.type === "NEW_MESSAGE") {
          setUnreadCount((c) => c + 1);

          // Also set OS/app icon badge (if supported)
          if ("setAppBadge" in navigator) {
            navigator.setAppBadge(unreadCount + 1).catch(() => {});
          }
        }
      };

      navigator.serviceWorker.addEventListener("message", handler);

      return () =>
        navigator.serviceWorker.removeEventListener("message", handler);
    }
  }, [unreadCount]);

  // helper to reset when user opens messages
  const resetUnread = () => {
    setUnreadCount(0);
    if ("clearAppBadge" in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  };

  return { unreadCount, resetUnread };
}
