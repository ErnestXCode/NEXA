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
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to send"}`);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {type === "email" && (
        <input
          type="text"
          placeholder="Subject"
          className="p-2 rounded bg-gray-900 text-white"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      )}
      <textarea
        placeholder={type === "chat" ? "Enter message..." : "Email body..."}
        className="p-2 rounded bg-gray-900 text-white min-h-[120px]"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={sendMessageMutation.isLoading}
        className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold disabled:opacity-50"
      >
        {sendMessageMutation.isLoading
          ? "Sending..."
          : type === "chat"
          ? "Send Message"
          : "Send Email"}
      </button>

      {message && <p className="mt-2">{message}</p>}
    </form>
  );
};

export default SendMessageForm;
