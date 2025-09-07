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

const ClassCard = ({ cls }) => {
  const total = cls.present + cls.absent + cls.late;
  const presentPct = total ? ((cls.present / total) * 100).toFixed(1) : 0;
  const absentPct = total ? ((cls.absent / total) * 100).toFixed(1) : 0;
  const latePct = total ? ((cls.late / total) * 100).toFixed(1) : 0;

  // Average per marking day
  const avgPerDay = cls.markCount ? Math.round(total / cls.markCount) : 0;

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow text-white">
      <h3 className="text-lg font-semibold mb-2">{cls._id}</h3>
      <p><span className="font-semibold">Marked:</span> {cls.markCount} days</p>
      <p><span className="font-semibold">Last Marked:</span> {cls.lastMarked ? new Date(cls.lastMarked).toLocaleDateString() : "—"}</p>
      <p><span className="font-semibold">Total Records:</span> {total}</p>
      <p><span className="font-semibold">Avg / Day:</span> {avgPerDay}</p>
      <div className="mt-2 text-sm">
        <p>✅ Present: {cls.present} ({presentPct}%)</p>
        <p>❌ Absent: {cls.absent} ({absentPct}%)</p>
        <p>⏰ Late: {cls.late} ({latePct}%)</p>
      </div>
    </div>
  );
};

const AttendanceDashboardAdmin = () => {
  const [classStats, setClassStats] = useState([]);
  const [startDate, setStartDate] = useState("2025-09-01");
  const [endDate, setEndDate] = useState("2025-09-07");

  const fetchClassStats = async () => {
    try {
      const res = await api.get("/attendance/class-stats", {
        params: { startDate, endDate },
      });
      setClassStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClassStats();
  }, [startDate, endDate]);

  const comparisonData = classStats.map((cls) => ({
    classLevel: cls._id,
    present: cls.present,
    absent: cls.absent,
    late: cls.late,
  }));

  const avgData = classStats.map((cls) => ({
    classLevel: cls._id,
    avgPerDay: cls.markCount ? Math.round((cls.present + cls.absent + cls.late) / cls.markCount) : 0,
    markCount: cls.markCount,
  }));

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
            className="ml-2 p-1 rounded bg-gray-700 text-white"
          />
        </label>
        <label>
          End:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 p-1 rounded bg-gray-700 text-white"
          />
        </label>
      </div>

      {/* Class-level cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {classStats.map((cls) => (
          <ClassCard key={cls._id} cls={cls} />
        ))}
      </div>

      {/* Comparison chart */}
      <div className="bg-gray-900 shadow rounded-xl p-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">Class Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="classLevel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#4CAF50" />
            <Line type="monotone" dataKey="absent" stroke="#F44336" />
            <Line type="monotone" dataKey="late" stroke="#FFC107" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Avg attendance per day + mark count */}
      <div className="bg-gray-900 shadow rounded-xl p-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">Average Attendance & Days Marked</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={avgData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="classLevel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgPerDay" stroke="#4CAF50" name="Avg Attendance" />
            <Line type="monotone" dataKey="markCount" stroke="#2196F3" name="Days Marked" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceDashboardAdmin;
