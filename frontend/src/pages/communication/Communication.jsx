// src/pages/communication/Communication.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const Communication = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get("/communication"); // backend endpoint
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, []);

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
              <h2 className="font-semibold">{msg.subject}</h2>
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
