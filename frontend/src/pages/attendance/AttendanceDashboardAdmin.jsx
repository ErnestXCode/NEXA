import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CustomSelect from "../../components/layout/CustomSelect";

const ClassCard = ({ cls }) => {
  const total = cls.present + cls.absent + cls.late;
  const presentPct = total ? ((cls.present / total) * 100).toFixed(1) : 0;
  const absentPct = total ? ((cls.absent / total) * 100).toFixed(1) : 0;
  const latePct = total ? ((cls.late / total) * 100).toFixed(1) : 0;

  const avgPerDay = cls.markCount ? Math.round(total / cls.markCount) : 0;

  return (
    <div className="bg-gray-950 p-5 rounded-2xl shadow-lg hover:shadow-emerald-700/20 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between">
      <h3 className="text-xl font-bold mb-3 border-b border-gray-800 pb-2">
        {cls._id}
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
        <div>
          <p className="font-medium">Marked Days:</p>
          <p className="text-white font-semibold">{cls.markCount}</p>
        </div>
        <div>
          <p className="font-medium">Last Marked:</p>
          <p className="text-white font-semibold">
            {cls.lastMarked
              ? new Date(cls.lastMarked).toLocaleDateString()
              : "—"}
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
        <div className="flex-1 bg-green-800/90 p-3 rounded-xl flex flex-col items-center shadow-sm">
          <p className="text-xs text-gray-200">Present</p>
          <p className="text-white font-semibold text-lg">
            {cls.present} ({presentPct}%)
          </p>
        </div>
        <div className="flex-1 bg-red-800/90 p-3 rounded-xl flex flex-col items-center shadow-sm">
          <p className="text-xs text-gray-200">Absent</p>
          <p className="text-white font-semibold text-lg">
            {cls.absent} ({absentPct}%)
          </p>
        </div>
        <div className="flex-1 bg-yellow-700/90 p-3 rounded-xl flex flex-col items-center shadow-sm">
          <p className="text-xs text-gray-200">Late</p>
          <p className="text-white font-semibold text-lg">
            {cls.late} ({latePct}%)
          </p>
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

  // 👇 Use actual values from context, Redux, or API if available
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [0, 1, 2].map((i) => {
      const startYear = currentYear - i;
      return `${startYear}/${startYear + 1}`;
    });
    setAcademicYears(years);
    setSelectedYear(years[0]); // default to current academic year
  }, []);

  const fetchClassStats = async () => {
    try {
      const res = await api.get("/attendance/class-stats", {
        params: { startDate, endDate, academicYear: selectedYear },
      });
      setClassStats(res.data);
      console.log(res);
    } catch (err) {
      console.error("Failed to fetch class stats", err);
    }
  };

  useEffect(() => {
    fetchClassStats();
  }, [startDate, endDate, selectedYear]); // include selectedYear

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
      {/* Filters */}
      <div className="bg-gray-950/80 border border-gray-800 backdrop-blur-sm rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-3">
        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <label className="text-sm text-gray-400 min-w-[50px]">Start</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 sm:w-44 p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <label className="text-sm text-gray-400 min-w-[50px]">End</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 sm:w-44 p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        <div className="w-full sm:w-44">
          <CustomSelect
            options={academicYears.map((y) => ({ label: y, value: y }))}
            value={selectedYear}
            onChange={setSelectedYear}
            placeholder="Select Year"
          />
        </div>

        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            onClick={fetchClassStats}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-white text-sm font-medium shadow-md"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Class-level cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classStats.map((cls) => (
          <ClassCard key={cls._id} cls={cls} />
        ))}
      </div>

      {/* Comparison chart (Line + Bar) */}
      <div className="bg-gray-950/90 border border-gray-900 shadow-lg rounded-2xl p-5 md:p-6 transition-all hover:shadow-emerald-700/10">

        <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">
          Class Comparison
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-x-auto">

          {/* Line Chart */}
          <ResponsiveContainer width="100%" height={300}>
  <LineChart data={comparisonData}>
    <defs>
      <linearGradient id="presentLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="absentLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="lateLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#facc15" />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
    <XAxis
      dataKey="classLevel"
      stroke="#d1d5db"
      tick={{ fontSize: 12 }}
    />
    <YAxis stroke="#d1d5db" />
    <Tooltip
      contentStyle={{
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        border: "1px solid #374151",
        borderRadius: "6px",
        fontSize: "0.85rem",
      }}
    />
    <Legend
      wrapperStyle={{
        color: "#e5e7eb",
        fontSize: "0.85rem",
      }}
    />

    <Line
      type="monotone"
      dataKey="present"
      stroke="url(#presentLine)"
      strokeWidth={3}
      dot={{ r: 3, strokeWidth: 1, fill: "#10b981" }}
      activeDot={{ r: 5 }}
    />
    <Line
      type="monotone"
      dataKey="absent"
      stroke="url(#absentLine)"
      strokeWidth={3}
      dot={{ r: 3, strokeWidth: 1, fill: "#ef4444" }}
      activeDot={{ r: 5 }}
    />
    <Line
      type="monotone"
      dataKey="late"
      stroke="url(#lateLine)"
      strokeWidth={3}
      dot={{ r: 3, strokeWidth: 1, fill: "#facc15" }}
      activeDot={{ r: 5 }}
    />
  </LineChart>
</ResponsiveContainer>


          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
  <BarChart data={comparisonData}>
    <defs>
      <linearGradient id="presentBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="absentBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="lateBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#facc15" />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
    <XAxis
      dataKey="classLevel"
      stroke="#d1d5db"
      tick={{ fontSize: 12 }}
    />
    <YAxis stroke="#d1d5db" />
    <Tooltip
      contentStyle={{
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        border: "1px solid #374151",
        borderRadius: "6px",
        fontSize: "0.85rem",
      }}
      formatter={(v) => v.toLocaleString()}
    />
    <Legend
      wrapperStyle={{
        color: "#e5e7eb",
        fontSize: "0.85rem",
      }}
    />

    <Bar dataKey="present" fill="url(#presentBar)" radius={[4, 4, 0, 0]} />
    <Bar dataKey="absent" fill="url(#absentBar)" radius={[4, 4, 0, 0]} />
    <Bar dataKey="late" fill="url(#lateBar)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>

        </div>
      </div>

      {/* Avg attendance per day + mark count (Line + Bar) */}
      <div className="bg-gray-950/90 border border-gray-900 shadow-lg rounded-2xl p-5 md:p-6 transition-all hover:shadow-emerald-700/10">

        <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">
          Average Attendance & Days Marked
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-x-auto">

          {/* Line Chart */}
         <ResponsiveContainer width="100%" height={300}>
  <LineChart data={avgData}>
    <defs>
      <linearGradient id="avgLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="markLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
    <XAxis
      dataKey="classLevel"
      stroke="#d1d5db"
      tick={{ fontSize: 12 }}
    />
    <YAxis stroke="#d1d5db" />
    <Tooltip
      contentStyle={{
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        border: "1px solid #374151",
        borderRadius: "6px",
        fontSize: "0.85rem",
      }}
      formatter={(v) => v.toLocaleString()}
    />
    <Legend
      wrapperStyle={{
        color: "#e5e7eb",
        fontSize: "0.85rem",
      }}
    />

    <Line
      type="monotone"
      dataKey="avgPerDay"
      stroke="url(#avgLine)"
      strokeWidth={3}
      dot={{ r: 3, strokeWidth: 1, fill: "#10b981" }}
      activeDot={{ r: 5 }}
      name="Avg Attendance"
    />
    <Line
      type="monotone"
      dataKey="markCount"
      stroke="url(#markLine)"
      strokeWidth={3}
      dot={{ r: 3, strokeWidth: 1, fill: "#3b82f6" }}
      activeDot={{ r: 5 }}
      name="Days Marked"
    />
  </LineChart>
</ResponsiveContainer>


          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
  <BarChart data={avgData} barGap={6}>
    <defs>
      <linearGradient id="avgBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="markBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
    <XAxis
      dataKey="classLevel"
      stroke="#d1d5db"
      tick={{ fontSize: 12 }}
    />
    <YAxis stroke="#d1d5db" />
    <Tooltip
      contentStyle={{
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        border: "1px solid #374151",
        borderRadius: "6px",
        fontSize: "0.85rem",
      }}
      formatter={(v) => v.toLocaleString()}
    />
    <Legend
      wrapperStyle={{
        color: "#e5e7eb",
        fontSize: "0.85rem",
      }}
    />

    <Bar
      dataKey="avgPerDay"
      fill="url(#avgBar)"
      name="Avg Attendance"
      radius={[6, 6, 0, 0]}
      barSize={20}
    />
    <Bar
      dataKey="markCount"
      fill="url(#markBar)"
      name="Days Marked"
      radius={[6, 6, 0, 0]}
      barSize={20}
    />
  </BarChart>
</ResponsiveContainer>

        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboardAdmin;
