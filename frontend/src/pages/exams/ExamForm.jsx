// src/pages/exams/ExamForm.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const allClasses = [
  "PP1", "PP2", "Grade 1", "Grade 2", "Grade 3", "Grade 4",
  "Grade 5", "Grade 6", "Form 1", "Form 2", "Form 3", "Form 4"
];

const ExamForm = () => {
  const [name, setName] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [date, setDate] = useState("");
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
      setTerm("Term 1");
      setClasses([]);
      setSubjects([]);
      setSubjectInput("");
      setDate("");
      queryClient.refetchQueries(["exams"]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to create exam"}`);
    },
  });

  const handleClassesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setClasses(selected);
  };

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!classes.length || !subjects.length) {
      setMessage("❌ Select at least one class and add at least one subject");
      return;
    }
    createExam.mutate({ name, term, classes, subjects, date });
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Exam</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Exam Name"
          className="p-2 rounded bg-gray-900 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select value={term} onChange={(e) => setTerm(e.target.value)} className="p-2 rounded bg-gray-900 text-white">
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>

        <select multiple value={classes} onChange={handleClassesChange} className="p-2 rounded bg-gray-900 text-white h-32">
          {allClasses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add Subject"
            className="p-2 rounded bg-gray-900 text-white flex-1"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
          />
          <button type="button" onClick={handleAddSubject} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">Add</button>
        </div>

        {subjects.length > 0 && (
          <p>Subjects: {subjects.join(", ")}</p>
        )}

        <input
          type="date"
          className="p-2 rounded bg-gray-900 text-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
