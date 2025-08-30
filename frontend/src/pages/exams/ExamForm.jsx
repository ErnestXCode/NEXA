// src/pages/exams/ExamForm.jsx
import React, { useState } from "react";
import api from "../../api/axios";

const ExamForm = () => {
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/exams", { name, classLevel, date, duration });
      setMessage("✅ Exam created successfully!");
      setName(""); setClassLevel(""); setDate(""); setDuration("");
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to create exam"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Exam</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96">
        <input
          type="text"
          placeholder="Exam Name"
          className="p-2 rounded bg-gray-900 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Class"
          className="p-2 rounded bg-gray-900 text-white"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
        />
        <input
          type="date"
          className="p-2 rounded bg-gray-900 text-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Duration (e.g., 2h)"
          className="p-2 rounded bg-gray-900 text-white"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold">
          Create Exam
        </button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default ExamForm;
