// src/pages/communication/SendMessageForm.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const SendMessageForm = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (newMessage) => {
      const res = await api.post("/communication", newMessage);
      return res.data;
    },
    onSuccess: () => {
      setMessage("✅ Message sent successfully!");
      setSubject("");
      setBody("");
      // refresh communication list
      queryClient.refetchQueries(["messages"]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to send message"}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage.mutate({ subject, body });
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Send Message</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96">
        <input
          type="text"
          placeholder="Subject"
          className="p-2 rounded bg-gray-900 text-white"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          placeholder="Message body"
          className="p-2 rounded bg-gray-900 text-white"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={sendMessage.isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold disabled:opacity-50"
        >
          {sendMessage.isLoading ? "Sending..." : "Send"}
        </button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default SendMessageForm;
