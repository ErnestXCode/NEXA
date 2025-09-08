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

  const avgPerDay = cls.markCount ? Math.round(total / cls.markCount) : 0;

  return (
    <div className="bg-gray-950 p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-3 border-b border-gray-800 pb-2">{cls._id}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
        <div>
          <p className="font-medium">Marked Days:</p>
          <p className="text-white font-semibold">{cls.markCount}</p>
        </div>
        <div>
          <p className="font-medium">Last Marked:</p>
          <p className="text-white font-semibold">
            {cls.lastMarked ? new Date(cls.lastMarked).toLocaleDateString() : "—"}
          </p>
        </div>
        <div>
          <p className="font-medium">Total Records:</p>
          <p className="text-white font-semibold">{total}</p>
        </div>
        <div>
          <p className="font-medium">Avg / Day:</p>
          <p className="text-white font-semibold">{avgPerDay}</p>
        </div>
      </div>

      {/* Metrics badges */}
      <div className="flex justify-between gap-2 mt-2">
        <div className="flex-1 bg-green-800 p-3 rounded-lg flex flex-col items-center">
          <p className="text-sm font-medium">Present</p>
          <p className="text-white font-bold text-lg">{cls.present} ({presentPct}%)</p>
        </div>
        <div className="flex-1 bg-red-800 p-3 rounded-lg flex flex-col items-center">
          <p className="text-sm font-medium">Absent</p>
          <p className="text-white font-bold text-lg">{cls.absent} ({absentPct}%)</p>
        </div>
        <div className="flex-1 bg-yellow-700 p-3 rounded-lg flex flex-col items-center">
          <p className="text-sm font-medium">Late</p>
          <p className="text-white font-bold text-lg">{cls.late} ({latePct}%)</p>
        </div>
      </div>
    </div>
  );
};

const AttendanceDashboardAdmin = () => {
  const [classStats, setClassStats] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
      .toISOString()
      .slice(0, 10)
  ); // default last 7 days
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

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

  // Prepare data for charts
  const comparisonData = classStats.map((cls) => ({
    classLevel: cls._id,
    present: cls.present,
    absent: cls.absent,
    late: cls.late,
  }));

  const avgData = classStats.map((cls) => ({
    classLevel: cls._id,
    avgPerDay: cls.markCount
      ? Math.round((cls.present + cls.absent + cls.late) / cls.markCount)
      : 0,
    markCount: cls.markCount,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Date range selector */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex items-center gap-2">
          Start:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-2 p-2 rounded bg-gray-900 text-white"
          />
        </label>
        <label className="flex items-center gap-2">
          End:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 p-2 rounded bg-gray-900 text-white"
          />
        </label>
      </div>

      {/* Class-level cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classStats.map((cls) => (
          <ClassCard key={cls._id} cls={cls} />
        ))}
      </div>

      {/* Comparison chart */}
      <div className="bg-gray-950 shadow-xl rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">Class Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="classLevel" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#4CAF50" />
            <Line type="monotone" dataKey="absent" stroke="#F44336" />
            <Line type="monotone" dataKey="late" stroke="#FFC107" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Avg attendance per day + mark count */}
      <div className="bg-gray-950 shadow-xl rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">
          Average Attendance & Days Marked
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={avgData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="classLevel" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgPerDay"
              stroke="#4CAF50"
              name="Avg Attendance"
            />
            <Line
              type="monotone"
              dataKey="markCount"
              stroke="#2196F3"
              name="Days Marked"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceDashboardAdmin;
