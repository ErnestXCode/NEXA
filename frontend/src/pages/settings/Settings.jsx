// src/pages/settings/Settings.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";

const Settings = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/auth/update/${currentUser._id}`, { name, email });
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Update failed"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form
        onSubmit={handleUpdate}
        className="flex flex-col gap-4 bg-gray-900 p-4 rounded-lg w-96"
      >
        <label>Name</label>
        <input
          type="text"
          className="p-2 rounded bg-gray-800 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Email</label>
        <input
          type="email"
          className="p-2 rounded bg-gray-800 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold">
          Update
        </button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default Settings;
