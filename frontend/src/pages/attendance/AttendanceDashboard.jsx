// src/pages/attendance/AttendanceDashboard.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";

const fetchAttendance = async (startDate, endDate) => {
  const query = new URLSearchParams({ startDate, endDate }).toString();
  const res = await api.get(`/attendance/get?${query}`);
  return res.data;
};

const fetchHighAbsenteeism = async () => {
  const res = await api.get("/attendance/high-absenteeism");
  return res.data;
};

const AttendanceDashboard = () => {
  const queryClient = useQueryClient();
  const [notifyParents, setNotifyParents] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  // Fetch today attendance
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ["todayAttendance"],
    queryFn: () => fetchAttendance(today, today),
  });

  // Fetch weekly attendance for trend chart
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const { data: weeklyAttendance = [] } = useQuery({
    queryKey: ["weeklyAttendance"],
    queryFn: () =>
      fetchAttendance(weekStart.toISOString().split("T")[0], today),
  });

  // Fetch high absenteeism students
  const { data: highAbsentees = [] } = useQuery({
    queryKey: ["highAbsentees"],
    queryFn: fetchHighAbsenteeism,
  });

  // Parent notification mutation
  const notifyMutation = useMutation({
    mutationFn: () =>
      api.post("/attendance/notify-parents", { students: highAbsentees }),
    onSuccess: () => alert("✅ Parents notified successfully"),
    onError: (err) => alert("❌ Failed to notify parents"),
  });

  const handleNotifyParents = () => {
    notifyMutation.mutate();
  };

  // Prepare line chart data including Late
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = weeklyAttendance.filter(
      (rec) => new Date(rec.date).toISOString().split("T")[0] === dateStr
    );
    const present = dayRecords.filter((r) => r.status === "present").length;
    const absent = dayRecords.filter((r) => r.status === "absent").length;
    const late = dayRecords.filter((r) => r.status === "late").length;
    chartData.push({ date: dateStr, present, absent, late });
  }

  // Today counts
  const presentCount = todayAttendance.filter((r) => r.status === "present")
    .length;
  const absentCount = todayAttendance.filter((r) => r.status === "absent")
    .length;
  const lateCount = todayAttendance.filter((r) => r.status === "late").length;

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Attendance Dashboard</h1>

      {/* Summary Cards */}
      <div className="flex gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded flex-1 text-center">
          <p className="text-gray-400">Present Today</p>
          <p className="text-3xl font-bold">{presentCount}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded flex-1 text-center">
          <p className="text-gray-400">Absent Today</p>
          <p className="text-3xl font-bold">{absentCount}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded flex-1 text-center">
          <p className="text-gray-400">Late Today</p>
          <p className="text-3xl font-bold">{lateCount}</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-gray-900 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Attendance Trend (Last 7 Days)
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line type="monotone" dataKey="present" stroke="#00ff00" />
            <Line type="monotone" dataKey="absent" stroke="#ff4d4d" />
            <Line type="monotone" dataKey="late" stroke="#ffd700" /> {/* Gold color */}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* High Absenteeism Table */}
      <div className="bg-gray-900 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">
          High Absenteeism Students (&gt;3 absences)
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-2 px-3 text-left">Student</th>
              <th className="py-2 px-3 text-left">Class</th>
              <th className="py-2 px-3 text-left">Absences</th>
              <th className="py-2 px-3 text-left">Late</th> {/* New column */}
            </tr>
          </thead>
          <tbody>
            {highAbsentees.length > 0 ? (
              highAbsentees.map((s, i) => (
                <tr
                  key={s._id}
                  className={`${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}`}
                >
                  <td className="py-2 px-3">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="py-2 px-3">{s.classLevel}</td>
                  <td className="py-2 px-3">{s.absences}</td>
                  <td className="py-2 px-3">{s.late || 0}</td> {/* Late count */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">
                  No students with high absenteeism
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Parent Notification */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifyParents}
            onChange={() => setNotifyParents(!notifyParents)}
            className="w-4 h-4"
          />
          <label>Notify parents of high absenteeism</label>
          <button
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded ml-2"
            onClick={handleNotifyParents}
            disabled={!notifyParents}
          >
            Send Notifications
          </button>
        </div>
      </div>
    </main>
  );
};

export default AttendanceDashboard;
