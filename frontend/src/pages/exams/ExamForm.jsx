import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const allClasses = [
  "PP1","PP2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Form 1","Form 2","Form 3","Form 4"
];

const ExamForm = () => {
  const [name, setName] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [classes, setClasses] = useState([]);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const createExam = useMutation({
    mutationFn: (newExam) => api.post("/exam", newExam),
    onSuccess: () => {
      setMessage("✅ Exam created successfully!");
      setName(""); setTerm("Term 1"); setClasses([]); setDate("");
      queryClient.refetchQueries(["exams"]);
    },
    onError: (err) => setMessage(`❌ ${err.response?.data?.msg || "Failed to create exam"}`)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !classes.length || !date) return setMessage("❌ Fill all fields");
    createExam.mutate({ name, term, classes, date });
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Exam</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input type="text" placeholder="Exam Name" value={name} onChange={e=>setName(e.target.value)} className="p-2 rounded bg-gray-900" required />
        <select value={term} onChange={e=>setTerm(e.target.value)} className="p-2 rounded bg-gray-900">
          <option>Term 1</option><option>Term 2</option><option>Term 3</option>
        </select>
        <select multiple value={classes} onChange={e=>setClasses(Array.from(e.target.selectedOptions,o=>o.value))} className="p-2 rounded bg-gray-900 h-32">
          {allClasses.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="p-2 rounded bg-gray-900" required />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded">{createExam.isLoading ? "Creating..." : "Create Exam"}</button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default ExamForm;
