import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const fetchExams = async () => {
  const res = await api.get("/exam");
  return res.data;
};

const RecordResult = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    studentId: "",
    examId: "",
    subject: "",
    score: "",
    grade: "",
  });
  const [message, setMessage] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: fetchExams,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const recordResultMutation = useMutation({
    mutationFn: (newResult) => api.post("/exam/record-result", newResult),
    onSuccess: () => {
      setMessage("✅ Result recorded successfully!");
      setFormData({ studentId: "", examId: "", subject: "", score: "", grade: "" });
      // if recording should update any list, invalidate here
      queryClient.refetchQueries(["exams"]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to record result"}`);
    },
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-900"
          required
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.firstName} {s.lastName}
            </option>
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
            <option key={e._id} value={e._id}>
              {e.name}
            </option>
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
          disabled={recordResultMutation.isLoading}
        >
          {recordResultMutation.isLoading ? "Recording..." : "Record Result"}
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </main>
  );
};

export default RecordResult;
