import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const MessagesList = () => {
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await api.get("/communication?type=chat");
      return res.data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 flex items-center justify-center h-[500px]">
        <p className="text-gray-400">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow flex flex-col h-[500px]">
      <h2 className="text-lg font-semibold p-4 border-b border-gray-800">
        In-App Chat
      </h2>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">No messages yet</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((msg) => (
              <li
                key={msg._id}
                className="flex items-start gap-3 bg-gray-800 p-3 rounded-lg"
              >
                {/* Avatar / Initial */}
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                  {msg.sender?.name?.[0]?.toUpperCase() || "U"}
                </div>

                {/* Message Body */}
                <div className="flex-1">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{msg.sender?.name || "Unknown"}</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 text-white">{msg.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
