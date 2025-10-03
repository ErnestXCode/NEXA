import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

export default function useUnreadProofs(currentUser) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.school) return;
    if (!["admin", "bursar"].includes(currentUser.role)) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_API_BASE_URL);
    }

    socket.emit("joinSchool", currentUser.school);

    const handler = (proof) => {
      setUnreadCount((c) => c + 1);

      if ("setAppBadge" in navigator) {
        navigator.setAppBadge(unreadCount + 1).catch(() => {});
      }
    };

    socket.on("newProof", handler);

    return () => socket.off("newProof", handler);
  }, [currentUser]);

  const resetUnread = () => {
    setUnreadCount(0);
    if ("clearAppBadge" in navigator) navigator.clearAppBadge().catch(() => {});
  };

  return { unreadCount, resetUnread };
}
