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
import AttendanceDetails from "./AttendanceDetails";

const MetricCard = ({ title, value, pct, bgColor }) => (
  <div className={`${bgColor} p-5 rounded-2xl shadow-xl flex flex-col items-center`}>
    <p className="text-sm font-medium">{title}</p>
    <p className="text-2xl font-bold mt-2">
      {value} {pct !== undefined ? `(${pct}%)` : ""}
    </p>
  </div>
);

const AttendanceDashboardClassTeacher = () => {
  const [rangeStats, setRangeStats] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [terms] = useState(["Term 1", "Term 2", "Term 3"]);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // populate academic years
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setAcademicYears([currentYear, currentYear - 1, currentYear - 2]);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const rangeRes = await api.get("/attendance/range", {
        params: { startDate, endDate, academicYear: selectedYear, term: selectedTerm },
      });
      const chartData = rangeRes.data.map((d) => ({
        date: d._id,
        present: d.present,
        absent: d.absent,
        late: d.late,
      }));
      setRangeStats(chartData);

      const absRes = await api.get("/attendance/absentees", {
        params: { days: 7, academicYear: selectedYear, term: selectedTerm },
      });
      setAbsentees(absRes.data);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedYear, selectedTerm]);

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

  if (loading) {
    return <div className="p-6 text-gray-400">Loading attendance data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
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
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="p-2 rounded bg-gray-900 text-white"
        >
          {terms.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 rounded bg-gray-900 text-white"
        >
          {academicYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <MetricCard title="Present" value={totalPresent} pct={presentPct} bgColor="bg-green-800" />
        <MetricCard title="Absent" value={totalAbsent} pct={absentPct} bgColor="bg-red-800" />
        <MetricCard title="Late" value={totalLate} pct={latePct} bgColor="bg-yellow-700" />
        <MetricCard title="Total Records" value={totalStudents} bgColor="bg-gray-800" />
      </div>

      {/* Detailed records */}
      <AttendanceDetails />

      {/* Attendance Trend */}
      <div className="bg-gray-950 shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">Attendance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rangeStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#4CAF50" />
            <Line type="monotone" dataKey="absent" stroke="#F44336" />
            <Line type="monotone" dataKey="late" stroke="#FFC107" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chronic Absentees */}
      <div className="bg-gray-950 shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">
          Chronic Absentees (7 days)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-800 text-white">
            <thead>
              <tr className="bg-gray-900 text-left">
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">Class</th>
                <th className="px-4 py-2">Absences</th>
              </tr>
            </thead>
            <tbody>
              {absentees.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-400">
                    No chronic absentees found
                  </td>
                </tr>
              )}
              {absentees.map((s) => (
                <tr key={s._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-2">{s.classLevel}</td>
                  <td className="px-4 py-2">{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboardClassTeacher;
