// src/pages/attendance/StudentAttendanceForm.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async (classLevel) => {
  const res = classLevel
    ? await api.get(`/students?classLevel=${classLevel}`)
    : await api.get(`/students`);
  return res.data;
};

// check if attendance already exists for a class on a given date
const fetchAttendanceStatus = async (classLevel, date) => {
  if (!classLevel) return null;
  const res = await api.get(`/attendance`, {
    params: { classLevel, date },
  });
  return res.data.length > 0; // true if attendance exists
};

const StudentAttendanceForm = () => {
  const queryClient = useQueryClient();
  const [classLevel, setClassLevel] = useState(""); // blank = all students
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["students", classLevel],
    queryFn: () => fetchStudents(classLevel),
  });

  const { data: isMarked } = useQuery({
    queryKey: ["attendanceStatus", classLevel, date],
    queryFn: () => fetchAttendanceStatus(classLevel, date),
    enabled: !!classLevel, // only check if class is selected
  });

  const mutation = useMutation({
    mutationFn: async (attendanceData) =>
      Promise.all(
        attendanceData.map((entry) => api.post("/attendance", entry))
      ),
    onSuccess: () => {
      setMessage("✅ Attendance saved successfully!");
      setAttendance({});
      queryClient.refetchQueries(["attendance"]);
      queryClient.refetchQueries(["attendanceStatus", classLevel, date]);
    },
    onError: (err) => {
      setMessage(
        `❌ ${err.response?.data?.msg || "Failed to save attendance"}`
      );
    },
  });

  const handleChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: { ...attendance[studentId], status },
    });
  };

  const handleReasonChange = (studentId, reason) => {
    setAttendance({
      ...attendance,
      [studentId]: { ...attendance[studentId], reason },
    });
  };

  const handleMarkAllPresent = () => {
    if (!students.length) return;

    const newAttendance = {};
    students.forEach((s) => {
      if (!classLevel || s.classLevel === classLevel) {
        newAttendance[s._id] = { status: "present", reason: "" };
      }
    });

    setAttendance((prev) => ({ ...prev, ...newAttendance }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const attendanceData = students
      .filter((s) => !classLevel || s.classLevel === classLevel)
      .map((student) => ({
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
        <button
          type="button"
          onClick={handleMarkAllPresent}
          className="bg-green-600 hover:bg-green-700 p-2 rounded"
        >
          Mark All Present
        </button>
      </div>

      {/* 🔒 Lock form if attendance already marked */}
      {isMarked ? (
        <div className="bg-green-900 text-green-300 p-4 rounded">
          ✔ Attendance already marked for this class today.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {students
            .filter((s) => !classLevel || s.classLevel === classLevel)
            .map((s) => (
              <div
                key={s._id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-800 hover:border-gray-700 transition"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {s.firstName} {s.lastName}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Class: {s.classLevel} {s.stream && ` | Stream: ${s.stream}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={attendance[s._id]?.status || ""}
                    onChange={(e) => handleChange(s._id, e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-600"
                    disabled={isMarked} // 🔒 frontend lock
                  >
                    <option value="">Select status</option>
                    <option value="present">✅ Present</option>
                    <option value="absent">❌ Absent</option>
                    <option value="late">⏰ Late</option>
                  </select>

                  {attendance[s._id]?.status === "absent" && (
                    <input
                      type="text"
                      placeholder="Reason"
                      value={attendance[s._id]?.reason || ""}
                      onChange={(e) =>
                        handleReasonChange(s._id, e.target.value)
                      }
                      className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600"
                      disabled={isMarked}
                    />
                  )}
                </div>
              </div>
            ))}

          <button
            type="submit"
            disabled={isMarked}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl font-semibold mt-4 w-full sm:w-auto"
          >
            {isMarked ? "✔ Already Marked" : "Submit Attendance"}
          </button>

          {message && (
            <p className="mt-3 text-sm text-gray-300 bg-gray-800 p-2 rounded">
              {message}
            </p>
          )}
        </form>
      )}
    </main>
  );
};

export default StudentAttendanceForm;
