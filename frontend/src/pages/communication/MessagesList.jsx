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
    refetchInterval: 5000, // auto-refresh for chat
  });

  if (isLoading) return <p>Loading messages...</p>;

  return (
    <div className="bg-gray-900 rounded flex flex-col h-[500px]">
      <h2 className="text-lg font-bold p-4 border-b border-gray-700">
        In-App Chat
      </h2>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-400">No messages yet</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((msg) => (
              <li
                key={msg._id}
                className="bg-gray-800 p-2 rounded"
              >
                <p className="text-sm text-gray-400">
                  {msg.sender?.name || "Unknown"} •{" "}
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
                <p>{msg.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
