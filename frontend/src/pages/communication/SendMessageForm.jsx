// src/pages/communication/SendMessageForm.jsx
import React, { useState } from "react";
import api from "../../api/axios";

const SendMessageForm = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/communication", { subject, body });
      setMessage("✅ Message sent successfully!");
      setSubject("");
      setBody("");
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to send message"}`);
    }
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
        />
        <textarea
          placeholder="Message body"
          className="p-2 rounded bg-gray-900 text-white"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold">
          Send
        </button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default SendMessageForm;
