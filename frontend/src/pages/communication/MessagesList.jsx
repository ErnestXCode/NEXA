// src/pages/communication/MessagesList.jsx
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import api from "../../api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

// Connect once
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

const MessagesList = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef();

  // Fetch message history
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

    socket.emit("joinSchool", currentUser.school);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]); // Append new message
    });

    return () => {
      socket.off("newMessage");
    };
  }, [currentUser]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const getDateLabel = (dateStr) => {
    const date = dayjs(dateStr);
    if (date.isToday()) return "Today";
    if (date.isYesterday()) return "Yesterday";
    return date.format("MMM D, YYYY");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading messages...
      </div>
    );
  }

  // Sort messages oldest → newest
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Group messages by date label
  const groupedMessages = sortedMessages.reduce((groups, msg) => {
    const dateLabel = getDateLabel(msg.createdAt);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-[500px] border border-gray-800 rounded-2xl overflow-hidden bg-gray-950 shadow-md">
      <div
        ref={containerRef}
        className="flex-1 flex flex-col justify-start overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {sortedMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            No messages yet
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <div key={dateLabel} className="relative">
              {/* WhatsApp-style date badge */}
              <div className="sticky top-0 z-10 flex justify-center my-3">
                <span className="px-3 py-1 text-xs font-medium text-gray-200 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md border border-gray-700">
                  {dateLabel}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5">
                {msgs.map((msg) => {
                  const isOwn = msg.sender?.name === currentUser?.name;
                  return (
                    <li
                      key={msg._id}
                      className={`flex items-start gap-3 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex-shrink-0">
                          {msg.sender?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="max-w-[80%] relative flex flex-col">
                        {!isOwn && (
                          <span className="absolute -left-2 top-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-gray-900 border-b-[8px] border-b-transparent"></span>
                        )}
                        {isOwn && (
                          <span className="absolute -right-2 top-2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-blue-600 border-b-[8px] border-b-transparent"></span>
                        )}

                        <div
                          className={`p-2.5 rounded-xl shadow-md break-words ${
                            isOwn
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-900 text-gray-200 rounded-bl-none"
                          }`}
                        >
                          {!isOwn && (
                            <div className="text-xs font-medium text-gray-300 mb-1">
                              [{msg.sender?.role}]{" "}
                              {msg.sender?.name || "Unknown"}
                            </div>
                          )}
                          <div>{msg.body || " "}</div>
                        </div>

                        <div
                          className={`text-[10px] mt-1 ${
                            isOwn ? "text-gray-300 self-end" : "text-gray-500"
                          }`}
                        >
                          {msg.createdAt
                            ? dayjs(msg.createdAt).format("HH:mm")
                            : " "}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesList;
