import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const SendMessageForm = ({ type }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage) => {
      const res = await api.post("/communication", newMessage);
      return res.data;
    },
    onSuccess: () => {
      setMessage("✅ Sent successfully!");
      setSubject("");
      setBody("");
      queryClient.refetchQueries(["messages"]);
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to send"}`);
      setTimeout(() => setMessage(""), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setMessage("❌ Please enter a message");
      return;
    }
    sendMessageMutation.mutate({ subject, body, type });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 rounded-lg shadow p-6 flex flex-col gap-4"
    >
      <h2 className="text-lg font-semibold mb-2">
        {type === "chat" ? "Send Message" : "Send Email"}
      </h2>

      {type === "email" && (
        <input
          type="text"
          placeholder="Subject"
          className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-green-600 outline-none"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      )}

      <textarea
        placeholder={
          type === "chat" ? "Write your message..." : "Write your email..."
        }
        className="p-3 rounded bg-gray-800 text-white min-h-[120px] border border-gray-700 focus:ring-2 focus:ring-blue-600 outline-none"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={sendMessageMutation.isLoading}
        className={`px-4 py-2 rounded font-semibold transition ${
          type === "chat"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-green-600 hover:bg-green-700"
        } disabled:opacity-50`}
      >
        {sendMessageMutation.isLoading
          ? "Sending..."
          : type === "chat"
          ? "Send Message"
          : "Send Email"}
      </button>

      {message && (
        <div
          className={`mt-2 p-2 rounded text-sm ${
            message.startsWith("✅")
              ? "bg-green-700 text-green-100"
              : "bg-red-700 text-red-100"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
};

export default SendMessageForm;
