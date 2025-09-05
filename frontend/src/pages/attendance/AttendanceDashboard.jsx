import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AttendanceDashboard = () => {
  const [rangeStats, setRangeStats] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [startDate, setStartDate] = useState("2025-09-01");
  const [endDate, setEndDate] = useState("2025-09-07");

  // Fetch data
  const fetchData = async () => {
    try {
      const rangeRes = await api.get("/attendance/range", {
        params: { startDate, endDate },
      });
      setRangeStats(rangeRes.data);
      
      const absRes = await api.get("/attendance/absentees", {
        params: { days: 7 },
      });
      setAbsentees(absRes.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  console.log('abs----', absentees)
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Compute summary totals and percentages
  const totalStudents = rangeStats.reduce(
    (acc, day) => acc + day.present + day.absent + day.late,
    0
  );
  const totalPresent = rangeStats.reduce((acc, day) => acc + day.present, 0);
  const totalAbsent = rangeStats.reduce((acc, day) => acc + day.absent, 0);
  const totalLate = rangeStats.reduce((acc, day) => acc + day.late, 0);

  const presentPct = totalStudents ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0;
  const absentPct = totalStudents ? ((totalAbsent / totalStudents) * 100).toFixed(1) : 0;
  const latePct = totalStudents ? ((totalLate / totalStudents) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Date range selector */}
      <div className="flex gap-4 mb-4">
        <label>
          Start:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-2 p-1 rounded bg-gray-800 text-white"
          />
        </label>
        <label>
          End:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 p-1 rounded bg-gray-800 text-white"
          />
        </label>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-600 p-4 rounded-xl shadow text-white">
          <h3 className="text-sm font-medium">Present</h3>
          <p className="text-2xl font-bold">
            {totalPresent} ({presentPct}%)
          </p>
        </div>
        <div className="bg-red-600 p-4 rounded-xl shadow text-white">
          <h3 className="text-sm font-medium">Absent</h3>
          <p className="text-2xl font-bold">
            {totalAbsent} ({absentPct}%)
          </p>
        </div>
        <div className="bg-yellow-500 p-4 rounded-xl shadow text-white">
          <h3 className="text-sm font-medium">Late</h3>
          <p className="text-2xl font-bold">
            {totalLate} ({latePct}%)
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-xl shadow text-white">
          <h3 className="text-sm font-medium">Total Records</h3>
          <p className="text-2xl font-bold">{totalStudents}</p>
        </div>
      </div>

      {/* Attendance Trend */}
      <div className="bg-gray-900 shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rangeStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#4CAF50" />
            <Line type="monotone" dataKey="absent" stroke="#F44336" />
            <Line type="monotone" dataKey="late" stroke="#FFC107" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chronic Absentees */}
      <div className="bg-gray-900 shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Chronic Absentees (7 days)</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2">Student ID</th>
              <th className="px-4 py-2">Absences</th>
            </tr>
          </thead>
          <tbody>
            {absentees.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="px-4 py-2">{s._id}</td>
                <td className="px-4 py-2">{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
