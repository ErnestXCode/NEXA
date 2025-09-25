// src/pages/communication/MessagesList.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import api from "../../api/axios";

// connect once
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

const MessagesList = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch (load history)
  useEffect(() => {
    let mounted = true;
    api
      .get("/communication?type=chat")
      .then((res) => {
        if (mounted) {
          setMessages(res.data);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!currentUser?.school) return;

    // Join school room for live messages
    socket.emit("joinSchool", currentUser.school);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [msg, ...prev]); // prepend new message
    });

    return () => {
      socket.off("newMessage");
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading messages...
      </div>
    );
  }

 return (
  <div className="flex flex-col h-[500px] border border-gray-800 rounded-2xl overflow-hidden bg-gray-950 shadow-md">
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">No messages yet</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((msg) => {
            const isOwn = msg.sender?.name === currentUser?.name;
            return (
              <li
                key={msg._id}
                className={`flex items-start gap-2 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar */}
                {!isOwn && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex-shrink-0 mt-1">
                    {msg.sender?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}

                {/* Bubble */}
                <div className="max-w-[70%]">
                  <div
                    className={`text-xs mb-1 flex justify-between ${
                      isOwn ? "text-right pr-1" : "pl-1"
                    }`}
                  >
                    {!isOwn && (
                      <span className="font-medium text-gray-300">
                        [{msg.sender?.role}] {msg.sender?.name || "Unknown"}
                      </span>
                    )}
                    <span className="text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl shadow-md break-words ${
                      isOwn
                        ? "bg-blue-600 text-white ml-auto"
                        : "bg-gray-900 text-gray-200"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </div>
);

};

export default MessagesList;
