// src/pages/exams/ExamForm.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const ExamForm = () => {
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const createExam = useMutation({
    mutationFn: async (newExam) => {
      const res = await api.post("/exam", newExam);
      return res.data;
    },
    onSuccess: () => {
      setMessage("✅ Exam created successfully!");
      setName("");
      setClassLevel("");
      setDate("");
      setSubject("");
      // invalidate cached exams list so Exams.jsx refetches
      queryClient.refetchQueries(["exams"]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to create exam"}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createExam.mutate({ name, classLevel, date, subject });
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
          required
        />
        <input
          type="text"
          placeholder="Class"
          className="p-2 rounded bg-gray-900 text-white"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          required
        />
        <input
          type="date"
          className="p-2 rounded bg-gray-900 text-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          className="p-2 rounded bg-gray-900 text-white"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={createExam.isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold disabled:opacity-50"
        >
          {createExam.isLoading ? "Creating..." : "Create Exam"}
        </button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default ExamForm;
