// src/pages/communication/Communication.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchMessages = async () => {
  const res = await api.get("/communication");
  return res.data;
};

const Communication = () => {
  const { data: messages = [], isLoading, isError } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
    staleTime: 1000 * 60 * 5, // keep fresh for 5 minutes
  });

  if (isLoading) {
    return (
      <main className="p-6 bg-gray-950 text-white min-h-screen">
        <p>Loading messages...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 bg-gray-950 text-white min-h-screen">
        <p className="text-red-500">❌ Failed to load messages</p>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Communication</h1>
      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((msg, i) => (
            <div
              key={msg._id || i}
              className="p-4 bg-gray-900 rounded shadow hover:bg-gray-800 transition"
            >
              <h2 className="font-semibold">
                {msg.subject}{" "}
                <span className="text-gray-400 text-sm">by {msg.sender}</span>
              </h2>
              <p>{msg.body}</p>
              <span className="text-gray-400 text-sm">
                {new Date(msg.date).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No messages found.</p>
        )}
      </div>
    </main>
  );
};

export default Communication;
