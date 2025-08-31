// src/pages/attendance/StudentAttendanceForm.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async (classLevel) => {
  const res = await api.get(`/students?classLevel=${classLevel}`);
  return res.data;
};

const StudentAttendanceForm = () => {
  const queryClient = useQueryClient();
  const [classLevel, setClassLevel] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["students", classLevel],
    queryFn: () => fetchStudents(classLevel),
    enabled: !!classLevel,
  });

  const mutation = useMutation({
    mutationFn: async (attendanceData) =>
      Promise.all(attendanceData.map((entry) => api.post("/attendance", entry))),
    onSuccess: () => {
      setMessage("✅ Attendance saved successfully!");
      setAttendance({});
      queryClient.refetchQueries(["attendance"]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to save attendance"}`);
    },
  });

  const handleChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: { ...attendance[studentId], status } });
  };

  const handleReasonChange = (studentId, reason) => {
    setAttendance({ ...attendance, [studentId]: { ...attendance[studentId], reason } });
  };

  const handleMarkAllPresent = () => {
    const newAttendance = {};
    students.forEach((s) => {
      newAttendance[s._id] = { status: "present", reason: "" };
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const attendanceData = students.map((student) => ({
      student: student._id,
      classLevel: student.classLevel,
      stream: student.stream,
      date: new Date(date),
      status: attendance[student._id]?.status || "present",
      reason: attendance[student._id]?.reason || "",
    }));
    mutation.mutate(attendanceData);
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

      <div className="flex gap-2 mb-4 items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded bg-gray-900"
        />
        <input
          type="text"
          placeholder="Class Level"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          className="p-2 rounded bg-gray-900"
        />
        <button type="button" onClick={handleMarkAllPresent} className="bg-green-600 hover:bg-green-700 p-2 rounded">
          Mark All Present
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {students.map((s) => (
          <div key={s._id} className="flex justify-between items-center bg-gray-900 p-3 rounded">
            <span>{s.firstName} {s.lastName}</span>
            <select
              value={attendance[s._id]?.status || ""}
              onChange={(e) => handleChange(s._id, e.target.value)}
              className="bg-gray-800 p-1 rounded"
            >
              <option value="">Select status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            {attendance[s._id]?.status === "absent" && (
              <input
                type="text"
                placeholder="Reason"
                value={attendance[s._id]?.reason || ""}
                onChange={(e) => handleReasonChange(s._id, e.target.value)}
                className="bg-gray-800 p-1 rounded ml-2"
              />
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold mt-2">
          Submit Attendance
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </main>
  );
};

export default StudentAttendanceForm;
