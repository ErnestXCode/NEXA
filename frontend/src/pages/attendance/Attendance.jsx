// src/pages/attendance/Attendance.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";


const Attendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance");
        setAttendance(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
      <div className="bg-gray-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-left">Class</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length > 0 ? (
              attendance.map((record, i) => (
                <tr
                  key={record._id || i}
                  className={`${
                    i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                  } hover:bg-gray-800 transition`}
                >
                  <td className="py-2 px-4">{record.studentName}</td>
                  <td className="py-2 px-4">{record.classLevel}</td>
                  <td className="py-2 px-4">{record.date}</td>
                  <td className="py-2 px-4">{record.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Attendance;
