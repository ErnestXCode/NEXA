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
      <div className="flex items-center justify-center h-[500px] text-gray-400">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <h2 className="text-lg font-semibold p-4 border-b border-gray-800">
        In-App Chat
      </h2>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">No messages yet</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((msg) => (
              <li
                key={msg._id}
                className="flex items-start gap-3 bg-gray-800 hover:bg-gray-700 transition-colors p-4 rounded-xl"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                  {msg.sender?.name?.[0]?.toUpperCase() || "U"}
                </div>

                {/* Message Body */}
                <div className="flex-1">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="font-medium text-gray-200">
                      {msg.sender?.name || "Unknown"}
                    </span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-white leading-relaxed">
                    {msg.body}
                  </p>
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
