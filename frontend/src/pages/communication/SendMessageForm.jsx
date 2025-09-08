import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const SendMessageForm = ({ type, mobile = false }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();
  const textareaRef = useRef();

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

  // Auto resize textarea on mobile
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [body]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 ${
        mobile
          ? "flex-row items-end w-full"
          : "bg-gray-900 rounded-lg shadow p-6 flex-col"
      }`}
    >
      {type === "email" && !mobile && (
        <input
          type="text"
          placeholder="Subject"
          className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-green-600 outline-none mb-2"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      )}

      <textarea
        ref={textareaRef}
        placeholder={
          type === "chat" ? "Type a message..." : "Write your email..."
        }
        className={`p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-600 outline-none resize-none ${
          mobile ? "flex-1 h-10 min-h-[36px]" : "min-h-[120px]"
        }`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <button
        type="submit"
        disabled={sendMessageMutation.isLoading}
        className={`ml-2 px-4 py-2 rounded font-semibold transition ${
          type === "chat"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-green-600 hover:bg-green-700"
        } disabled:opacity-50`}
      >
        {sendMessageMutation.isLoading
          ? "Sending..."
          : type === "chat"
          ? "➤"
          : "Send Email"}
      </button>

      {message && !mobile && (
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
