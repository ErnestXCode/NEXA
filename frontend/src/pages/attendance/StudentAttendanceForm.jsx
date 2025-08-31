// src/pages/attendance/StudentAttendanceForm.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const StudentAttendanceForm = () => {
  const queryClient = useQueryClient();
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: Infinity, // stays fresh unless invalidated
  });

  const mutation = useMutation({
    mutationFn: async (attendanceData) => {
      return Promise.all(
        attendanceData.map((entry) => api.post("/attendance", entry))
      );
    },
    onSuccess: () => {
      setMessage("✅ Attendance recorded successfully!");
      setAttendance({});
      queryClient.refetchQueries(["attendance"]); // refresh attendance list
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to record attendance"}`);
    },
  });

  const handleChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const attendanceData = students.map((student) => ({
      student: student._id,
      classLevel: student.classLevel,
      stream: student.stream,
      status: attendance[student._id],
      date: new Date(),
    }));
    mutation.mutate(attendanceData);
  };

  if (isLoading) return <p className="p-6">Loading students...</p>;

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {students.map((student) => (
          <div
            key={student._id}
            className="flex justify-between items-center bg-gray-900 p-3 rounded"
          >
            <span>
              {student.firstName} {student.lastName}
            </span>
            <select
              className="bg-gray-800 text-white p-1 rounded"
              value={attendance[student._id] || ""}
              onChange={(e) => handleChange(student._id, e.target.value)}
            >
              <option value="" disabled>
                Select status
              </option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        ))}
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold mt-3"
        >
          {mutation.isLoading ? "Submitting..." : "Submit Attendance"}
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </main>
  );
};

export default StudentAttendanceForm;
