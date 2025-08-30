import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const StudentAttendanceForm = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students");
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // send individual requests for each student
      await Promise.all(
        students.map((student) =>
          api.post("/attendance", {
            student: student._id,
            classLevel: student.classLevel,
            stream: student.stream,
            status: attendance[student._id],
            date: new Date(),
          })
        )
      );
      setMessage("✅ Attendance recorded successfully!");
      setAttendance({});
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to record attendance"}`);
    }
  };

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
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold mt-3"
        >
          Submit Attendance
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </main>
  );
};

export default StudentAttendanceForm;
