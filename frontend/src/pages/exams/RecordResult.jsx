import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const RecordResult = () => {
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    examId: "",
    subject: "",
    score: "",
    grade: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await api.get("/students");
        const examsRes = await api.get("/exam");
        setStudents(studentsRes.data);
        setExams(examsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/exam/record-result", formData);
      setMessage("✅ Result recorded successfully!");
      setFormData({ studentId: "", examId: "", subject: "", score: "", grade: "" });
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to record result"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Record Exam Result</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <select
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900"
          required
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
          ))}
        </select>

        <select
          name="examId"
          value={formData.examId}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900"
          required
        >
          <option value="">Select Exam</option>
          {exams.map((e) => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900"
          required
        />

        <input
          type="number"
          name="score"
          placeholder="Score"
          value={formData.score}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900"
          required
        />

        <input
          type="text"
          name="grade"
          placeholder="Grade"
          value={formData.grade}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          Record Result
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </main>
  );
};

export default RecordResult;
