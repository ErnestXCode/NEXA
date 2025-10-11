import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({
    name: "",
    term: "",
    date: "",
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  });
  const [editingExam, setEditingExam] = useState(null);

  const fetchExams = async () => {
    try {
      const res = await api.get("/exams", { params: { academicYear: form.academicYear } });
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/exams", form);
      setForm({
        name: "",
        term: "",
        date: "",
        academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      });
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (exam) => {
    setEditingExam({ ...exam });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/exams/${editingExam._id}`, editingExam);
      setEditingExam(null);
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
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Exams Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== Create Exam Form ===== */}
      <form
  onSubmit={handleCreate}
  className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700/50 space-y-6 transition-all hover:border-blue-600/40"
>
  <div className="absolute -top-4 left-6 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
    New Exam
  </div>

  <h2 className="text-3xl font-bold mb-6 text-center text-white tracking-wide">
    Create New Exam
  </h2>

  {/* Exam Name */}
  <div className="space-y-2">
    <label className="text-sm text-gray-300 font-medium">Exam Name</label>
    <input
      type="text"
      placeholder="e.g. Midterm Test"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      className="w-full p-3.5 rounded-xl bg-gray-800/70 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 text-gray-100 placeholder-gray-500 outline-none transition"
      required
    />
  </div>

  {/* Term Selection */}
  <div className="space-y-2">
    <label className="text-sm text-gray-300 font-medium">Term</label>
    <select
      value={form.term}
      onChange={(e) => setForm({ ...form, term: e.target.value })}
      className="w-full p-3.5 rounded-xl bg-gray-800/70 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 text-gray-100 outline-none transition"
      required
    >
      <option value="">Select Term</option>
      <option>Term 1</option>
      <option>Term 2</option>
      <option>Term 3</option>
    </select>
  </div>

  {/* Date */}
  <div className="space-y-2">
    <label className="text-sm text-gray-300 font-medium">Exam Date</label>
    <input
      type="date"
      value={form.date}
      onChange={(e) => setForm({ ...form, date: e.target.value })}
      className="w-full p-3.5 rounded-xl bg-gray-800/70 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 text-gray-100 outline-none transition"
      required
    />
  </div>

  {/* Academic Year */}
  <div className="space-y-2">
    <label className="text-sm text-gray-300 font-medium">Academic Year</label>
    <input
      type="text"
      placeholder="e.g. 2025/2026"
      value={form.academicYear}
      onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
      className="w-full p-3.5 rounded-xl bg-gray-800/70 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 text-gray-100 placeholder-gray-500 outline-none transition"
      required
    />
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className="w-full py-3.5 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold transition-all text-white text-lg shadow-md hover:shadow-blue-500/30 focus:ring-4 focus:ring-blue-500/40"
  >
    Create Exam
  </button>
</form>


        {/* ===== Exams List ===== */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-center">All Exams</h2>

          <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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
                    <button
                      onClick={() => handleEdit(exam)}
                      className="mt-3 md:mt-0 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Edit Modal ===== */}
      {editingExam && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <form
            onSubmit={handleUpdate}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md space-y-4"
          >
            <h2 className="text-2xl font-semibold text-center">Edit Exam</h2>

            <input
              type="text"
              value={editingExam.name}
              onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl"
              required
            />

            <select
              value={editingExam.term}
              onChange={(e) => setEditingExam({ ...editingExam, term: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl"
              required
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>

            <input
              type="date"
              value={editingExam.date?.substring(0, 10)}
              onChange={(e) => setEditingExam({ ...editingExam, date: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl"
              required
            />

            <input
              type="text"
              value={editingExam.academicYear}
              onChange={(e) => setEditingExam({ ...editingExam, academicYear: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl"
              required
            />

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
