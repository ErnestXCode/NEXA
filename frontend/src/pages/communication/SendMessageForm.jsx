import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const SendMessageForm = ({ type, mobile = false }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState("");

  const queryClient = useQueryClient();
  const textareaRef = useRef();

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage) => {
      const res = await api.post("/communication", newMessage);
      return res.data;
    },
    onSuccess: () => {
      setFeedback("✅ Sent successfully!");
      setBody("");
      setSubject("");
      queryClient.refetchQueries(["messages"]);
      setTimeout(() => setFeedback(""), 3000);
    },
    onError: (err) => {
      setFeedback(`❌ ${err.response?.data?.msg || "Failed to send"}`);
      setTimeout(() => setFeedback(""), 3000);
    },
  });

  // Handle Enter / Shift+Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setFeedback("❌ Please enter a message");
      return;
    }
    sendMessageMutation.mutate({ subject, body, type });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [body]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex ${mobile ? "flex-row items-end gap-2" : "flex-col"} 
                  bg-gray-900 rounded-2xl shadow-lg p-4 md:p-6 w-full`}
    >
      {/* Subject for emails on desktop */}
      {type === "email" && !mobile && (
        <input
          type="text"
          placeholder="Subject"
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-green-600 outline-none mb-3"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      )}

      {/* Message textarea */}
      <textarea
        ref={textareaRef}
        placeholder={type === "chat" ? "Type a message..." : "Write your email..."}
        className={`w-full p-2.5 md:p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-600 outline-none resize-none 
                    ${mobile ? "h-10 min-h-[36px]" : "min-h-[60px]"} 
                    scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Submit button */}
      <button
        type="submit"
        disabled={sendMessageMutation.isLoading}
        className={`px-4 py-2 rounded-lg font-semibold transition-all 
                    ${type === "chat" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                    disabled:opacity-50`}
      >
        {sendMessageMutation.isLoading
          ? "Sending..."
          : type === "chat"
          ? "➤"
          : "Send Email"}
      </button>

      {/* Feedback message */}
      {feedback && !mobile && (
        <div
          className={`mt-2 w-full p-2 rounded-lg text-sm 
                      ${feedback.startsWith("✅") ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"}`}
        >
          {feedback}
        </div>
      )}
    </form>
  );
};

export default SendMessageForm;
