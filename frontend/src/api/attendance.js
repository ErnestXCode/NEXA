// src/api/attendanceApi.js
import api from "./axios";

// 🔹 Get students by classLevel (you already have this endpoint in student routes)
export const fetchStudents = async (classLevel) => {
  const res = classLevel
    ? await api.get(`/students?classLevel=${classLevel}`)
    : await api.get(`/students`);
  return res.data;
};

// 🔹 Mark attendance (bulk or single student)
export const markAttendance = async (records) => {
  // records = [{ studentId, status }]
  const res = await api.post(`/attendance/mark`, { records });
  return res.data;
};

// 🔹 Get attendance for a class on a given date
export const fetchAttendanceByClassAndDate = async (classLevel, date) => {
  const res = await api.get(`/attendance/class/${classLevel}`, {
    params: { date },
  });
  return res.data;
};

// 🔹 Get attendance history for a student
export const fetchAttendanceByStudent = async (studentId, days = 30) => {
  const res = await api.get(`/attendance/student/${studentId}`, {
    params: { days },
  });
  return res.data;
};

// 🔹 Update a single attendance record
export const updateAttendance = async (id, status) => {
  const res = await api.put(`/attendance/${id}`, { status });
  return res.data;
};

// 🔹 Delete an attendance record
export const deleteAttendance = async (id) => {
  const res = await api.delete(`/attendance/${id}`);
  return res.data;
};
