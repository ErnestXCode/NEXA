import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({
    name: "",
    term: "",
    date: "",
    academicYear: "",
  });

  const fetchExams = async () => {
    try {
      const res = await api.get("/exams", {
        params: { academicYear: form.academicYear },
      });
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/exams", form);
      setForm({ name: "", term: "", date: "", academicYear: "" });
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Exams Management
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== Create Exam Form ===== */}
        <form
          onSubmit={handleCreate}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 space-y-5"
        >
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Create New Exam
          </h2>

          <input
            type="text"
            placeholder="Exam Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-3 w-full rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
            required
          />

          <select
            value={form.term}
            onChange={(e) => setForm({ ...form, term: e.target.value })}
            className="p-3 w-full rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
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
            className="p-3 w-full rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
            required
          />

          <input
            type="text"
            placeholder="Academic Year (e.g. 2025/2026)"
            value={form.academicYear}
            onChange={(e) =>
              setForm({ ...form, academicYear: e.target.value })
            }
            className="p-3 w-full rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition text-white text-lg"
          >
            Create Exam
          </button>
        </form>

        {/* ===== Exams List ===== */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 max-h-[600px] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">All Exams</h2>

          {exams.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              No exams found. Create your first exam!
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className="p-4 rounded-xl bg-gray-850 flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-700 hover:bg-gray-800 transition"
                >
                  <div>
                    <p className="font-semibold text-lg">{exam.name}</p>
                    <p className="text-gray-400 text-sm mt-1 md:mt-0">
                      {exam.term} — {exam.academicYear} —{" "}
                      {new Date(exam.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;
