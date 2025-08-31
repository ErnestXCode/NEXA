// src/pages/exams/RecordResult.jsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async () => (await api.get("/students")).data;
const fetchExams = async () => (await api.get("/exam")).data;

const RecordResult = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    studentId: "",
    examId: "",
    results: [], // { subject, score }
  });
  const [message, setMessage] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);

  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: fetchStudents });
  const { data: exams = [] } = useQuery({ queryKey: ["exams"], queryFn: fetchExams });

  useEffect(() => {
    if (formData.examId) {
      const selectedExam = exams.find(e => e._id === formData.examId);
      if (selectedExam) {
        const initResults = selectedExam.subjects.map(sub => ({ subject: sub, score: "" }));
        setFormData({ ...formData, results: initResults });
        setExamSubjects(selectedExam.subjects);
      }
    }
  }, [formData.examId, exams]);

  const recordResultMutation = useMutation({
    mutationFn: (data) => api.post("/exam/record-result", data),
    onSuccess: () => {
      setMessage("✅ Result recorded successfully!");
      setFormData({ studentId: "", examId: "", results: [] });
      queryClient.refetchQueries(["exams"]);
    },
    onError: (err) => setMessage(`❌ ${err.response?.data?.msg || "Failed to record result"}`),
  });

  const handleScoreChange = (index, value) => {
    const updatedResults = [...formData.results];
    updatedResults[index].score = Number(value);
    setFormData({ ...formData, results: updatedResults });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    recordResultMutation.mutate(formData);
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Record Exam Result</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <select
          name="studentId"
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
          className="w-full p-2 rounded bg-gray-900"
          required
        >
          <option value="">Select Exam</option>
          {exams.map((e) => (
            <option key={e._id} value={e._id}>{e.name} ({e.term})</option>
          ))}
        </select>

        {formData.results.map((r, i) => (
          <div key={i} className="flex justify-between gap-2 items-center">
            <span className="w-1/2">{r.subject}</span>
            <input
              type="number"
              value={r.score}
              onChange={(e) => handleScoreChange(i, e.target.value)}
              className="w-1/2 p-2 rounded bg-gray-900"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={recordResultMutation.isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {recordResultMutation.isLoading ? "Recording..." : "Record Result"}
        </button>

        {message && <p className="mt-2">{message}</p>}
      </form>
    </main>
  );
};

export default RecordResult;
