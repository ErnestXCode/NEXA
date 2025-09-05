import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ name: "", term: "", date: "" });

  const fetchExams = async () => {
    try {
      const res = await api.get("/exams");
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/exams", form);
      setForm({ name: "", term: "", date: "" });
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Exams</h1>

      {/* Create Exam Form */}
      <form onSubmit={handleCreate} className="bg-gray-900 p-4 rounded-lg shadow space-y-4">
        <input
          type="text"
          placeholder="Exam Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-2 w-full rounded bg-gray-800 text-white"
          required
        />
        <select
          value={form.term}
          onChange={(e) => setForm({ ...form, term: e.target.value })}
          className="p-2 w-full rounded bg-gray-800 text-white"
          required
        >
          <option value="">Select Term</option>
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="p-2 w-full rounded bg-gray-800 text-white"
          required
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Create Exam
        </button>
      </form>

      {/* Exam List */}
      <div className="bg-gray-900 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">All Exams</h2>
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li key={exam._id} className="p-2 border-b border-gray-700">
              <strong>{exam.name}</strong> — {exam.term} —{" "}
              {new Date(exam.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExamsPage;
