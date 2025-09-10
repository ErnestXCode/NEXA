import React, { useState, useEffect } from "react";
import SendMessageForm from "./SendMessageForm";
import MessagesList from "./MessagesList";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import api from "../../api/axios.js";

const Communication = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState("chat");
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);

  const showEmailTab =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // Check if notifications are already granted
  useEffect(() => {
    if (Notification.permission === "granted") {
      setNotificationsAllowed(true);
    }
  }, []);

  // Function to request permission and subscribe user
  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      // Send subscription to backend
      await api.post("/push/subscribe", subscription);

      console.log("Push subscription saved on server");
      setNotificationsAllowed(true); // hide the button
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
  };

  return (
    <main className="p-6 bg-gray-950 text-white flex flex-col">
      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "chat"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          In-App Messages
        </button>

        {/* {showEmailTab && (
          <button
            onClick={() => setActiveTab("email")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "email"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Email
          </button>
        )} */}
      </div>

      {/* Enable Notifications Button */}
      {!notificationsAllowed && "PushManager" in window && (
        <div className="mb-4">
          <button
            onClick={handleEnableNotifications}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="flex flex-col md:flex-row flex-1 gap-6">
          {/* Messages List */}
          <div className="flex-1 flex flex-col bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
            <MessagesList />
          </div>

          {/* Send Message Form */}
          <div className="md:flex-1 md:max-w-md">
            <div className="md:static fixed bottom-0 left-0 w-full md:w-auto p-4 bg-gray-950 md:bg-transparent z-10">
              <SendMessageForm type="chat" mobile />
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === "email" && showEmailTab && (
        <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-6">
          <SendMessageForm type="email" />
        </div>
      )}
    </main>
  );
};

export default Communication;
