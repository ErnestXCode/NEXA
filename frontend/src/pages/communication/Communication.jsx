import React, { useState } from "react";
import SendMessageForm from "./SendMessageForm";
import MessagesList from "./MessagesList";

const Communication = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <main className="p-6 bg-gray-950 text-white overflow-hidden">
      <h1 className="text-2xl font-bold mb-6">Communication</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === "chat"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          In-App Messages
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === "email"
              ? "bg-green-600 text-white shadow"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          Email
        </button>
      </div>

      {/* Content */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MessagesList />
          <SendMessageForm type="chat" />
        </div>
      )}

      {activeTab === "email" && (
        <div className="max-w-xl">
          <SendMessageForm type="email" />
        </div>
      )}
    </main>
  );
};

export default Communication;
