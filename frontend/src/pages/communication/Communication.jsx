import React, { useState } from "react";
import SendMessageForm from "./SendMessageForm";
import MessagesList from "./MessagesList";

const Communication = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Communication</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded ${
            activeTab === "chat" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          In-App Messages
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 rounded ${
            activeTab === "email" ? "bg-green-600" : "bg-gray-700"
          }`}
        >
          Email
        </button>
      </div>

      {activeTab === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SendMessageForm type="chat" />
          <MessagesList />
        </div>
      )}

      {activeTab === "email" && (
        <div className="max-w-lg">
          <SendMessageForm type="email" />
        </div>
      )}
    </main>
  );
};

export default Communication;
