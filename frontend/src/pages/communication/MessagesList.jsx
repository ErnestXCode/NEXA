import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";

const MessagesList = () => {
  const currentUser = useSelector(selectCurrentUser);

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
    <div className="flex flex-col h-[500px] border border-gray-800 rounded-2xl overflow-hidden bg-gray-950 shadow-md">
      <h2 className="text-lg font-semibold p-4 border-b border-gray-800 bg-gray-900 text-white">
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
                className="flex items-start gap-4 p-0"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex-shrink-0 mt-1">
                  {msg.sender?.name?.[0]?.toUpperCase() || "U"}
                </div>

                {/* Message Bubble */}
                <div className="flex-1">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1 px-4">
                    <span className="font-medium text-white">
                      [{msg.sender?.role}] {msg.sender?.name || "Unknown"}
                    </span>
                    <span className="text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-xl shadow-md break-words w-full">
                    {msg.body}
                  </div>
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
