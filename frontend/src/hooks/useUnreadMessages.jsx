import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

export default function useUnreadMessages(currentUser) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.school) return;

    // initialize socket once
    if (!socket) {
      socket = io(import.meta.env.VITE_API_BASE_URL); // backend URL
    }

    socket.emit("joinSchool", currentUser.school);

    const handler = (msg) => {
      if (msg.senderId !== currentUser.userId) {
        setUnreadCount((c) => c + 1);

        if ("setAppBadge" in navigator) {
          navigator.setAppBadge(unreadCount + 1).catch(() => {});
        }
      }
    };

    socket.on("newMessage", handler);

    // Also handle service worker messages
    if ("serviceWorker" in navigator) {
      const swHandler = (event) => {
        if (event.data?.type === "NEW_MESSAGE") {
          setUnreadCount((c) => c + 1);
          if ("setAppBadge" in navigator) {
            navigator.setAppBadge(unreadCount + 1).catch(() => {});
          }
        }
      };
      navigator.serviceWorker.addEventListener("message", swHandler);
      return () => navigator.serviceWorker.removeEventListener("message", swHandler);
    }

    return () => {
      socket.off("newMessage", handler);
    };
  }, [currentUser]);

  const resetUnread = () => {
    setUnreadCount(0);
    if ("clearAppBadge" in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  };

  return { unreadCount, resetUnread };
}
