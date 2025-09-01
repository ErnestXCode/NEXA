import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const SendMessageForm = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [type, setType] = useState("sms");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch classes and students for selection
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await api.get("/classes");
      return res.data;
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await api.get("/students");
      return res.data;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage) => {
      const res = await api.post("/communication", newMessage);
      return res.data;
    },
    onSuccess: () => {
      setMessage("✅ Message sent successfully!");
      setSubject("");
      setBody("");
      setRecipients([]);
      setType("sms");
      queryClient.refetchQueries(["messages"]);
      setShowModal(false);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to send message"}`);
      setShowModal(false);
    },
  });

  const handleAddRecipient = (type, value) => {
    // Avoid duplicates
    const exists = recipients.some((r) => r.type === type && r.value === value);
    if (!exists) setRecipients((prev) => [...prev, { type, value }]);
  };

  const handleRemoveRecipient = (index) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (recipients.length === 0) {
      setMessage("❌ Please select at least one recipient");
      return;
    }
    setShowModal(true);
  };

  const confirmSend = () => {
    sendMessageMutation.mutate({ subject, body, recipients, type });
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Send Message</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-lg">
        {/* Subject & Body */}
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

        {/* Recipient Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Recipients</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleAddRecipient("school", "all")}
              className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
            >
              Entire School
            </button>
            <button
              type="button"
              onClick={() => handleAddRecipient("role", "parents")}
              className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
            >
              Parents
            </button>
            <button
              type="button"
              onClick={() => handleAddRecipient("role", "teachers")}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
            >
              Teachers
            </button>
          </div>

          {/* Class selection */}
          {classes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {classes.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => handleAddRecipient("class", c._id)}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Student selection */}
          {students.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {students.slice(0, 20).map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => handleAddRecipient("student", s._id)}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Selected Recipients */}
          {recipients.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-gray-400">
              {recipients.map((r, i) => (
                <span
                  key={i}
                  className="bg-gray-800 px-2 py-1 rounded flex items-center gap-1"
                >
                  {r.type}:{r.value}
                  <button onClick={() => handleRemoveRecipient(i)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Type */}
        <div className="flex gap-2 mt-2">
          {["sms", "email", "whatsapp"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded ${
                type === t ? "bg-yellow-600" : "bg-gray-700"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={sendMessageMutation.isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold disabled:opacity-50 mt-4"
        >
          {sendMessageMutation.isLoading ? "Sending..." : "Send"}
        </button>

        {message && <p className="mt-2">{message}</p>}
      </form>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Send</h2>
            <p className="mb-4">
              Send message to <strong>{recipients.length}</strong> recipient
              {recipients.length > 1 ? "s" : ""}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmSend}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700"
              >
                Yes, Send
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SendMessageForm;
