import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL); // adjust URL

export default function useSocketMessages(schoolId, onMessage) {
  useEffect(() => {
    if (!schoolId) return;

    socket.emit("joinSchool", schoolId);

    socket.on("newMessage", (msg) => {
      onMessage(msg); // e.g., update unread count or messages array
    });

    return () => {
      socket.off("newMessage");
    };
  }, [schoolId]);
}
