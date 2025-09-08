import React, { useState } from "react";
import SendMessageForm from "./SendMessageForm";
import MessagesList from "./MessagesList";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";

const Communication = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState("chat");

  // Only show email tab for admin/superadmin
  const showEmailTab =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  return (
    <main className="p-4 md:p-6 bg-gray-950 text-white min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Communication</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
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

        {showEmailTab && (
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
        )}
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="flex flex-col md:flex-row flex-1 gap-4">
          {/* Messages List */}
          <div className="flex-1 flex flex-col h-[70vh] md:h-auto bg-gray-900 rounded-lg shadow overflow-hidden">
            <MessagesList />
          </div>

          {/* Send Message Form */}
          <div className="md:flex-1 md:max-w-md">
            {/* Mobile: position fixed at bottom */}
            <div className="md:static fixed bottom-0 left-0 w-full md:w-auto p-4 bg-gray-950 md:bg-transparent z-10 md:z-auto">
              <SendMessageForm type="chat" mobile />
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === "email" && showEmailTab && (
        <div className="w-full max-w-xl mx-auto">
          <SendMessageForm type="email" />
        </div>
      )}
    </main>
  );
};

export default Communication;
