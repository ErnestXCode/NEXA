import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import AttendanceDetails from "./AttendanceDetails";
import CustomSelect from "../../components/layout/CustomSelect";

const MetricCard = ({ title, value, pct, bgColor }) => (
  <div
    className={`${bgColor} p-3 sm:p-5 rounded-xl shadow-sm flex flex-col items-center text-center sm:text-left transition-colors`}
  >
    <p className="text-xs sm:text-sm font-medium text-gray-300">{title}</p>
    <p className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2 text-white">
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
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    `${currentYear}/${currentYear + 1}`
  );
  const [terms] = useState(["Term 1", "Term 2", "Term 3"]);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
      .toISOString()
      .slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // populate academic years
  // populate academic years
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [0, 1, 2].map((i) => {
      const startYear = currentYear - i;
      return `${startYear}/${startYear + 1}`;
    });
    setAcademicYears(years);
    setSelectedYear(years[0]);
  }, []);

  useEffect(() => {
    if (academicYears.length > 0) fetchData();
  }, [startDate, endDate, selectedYear, selectedTerm, academicYears]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const rangeRes = await api.get("/attendance/range", {
        params: {
          startDate,
          endDate,
          academicYear: selectedYear,
          term: selectedTerm,
        },
      });
      console.log(rangeRes);
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

  const presentPct = totalStudents
    ? ((totalPresent / totalStudents) * 100).toFixed(1)
    : 0;
  const absentPct = totalStudents
    ? ((totalAbsent / totalStudents) * 100).toFixed(1)
    : 0;
  const latePct = totalStudents
    ? ((totalLate / totalStudents) * 100).toFixed(1)
    : 0;

  if (loading) {
    return <div className="p-6 text-gray-400">Loading attendance data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
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

  {/* Term Select */}
  <div className="w-full sm:w-40">
    <CustomSelect
      options={terms.map((t) => ({ label: t, value: t }))}
      value={selectedTerm}
      onChange={setSelectedTerm}
      placeholder="Select Term"
    />
  </div>

  {/* Year Select */}
  <div className="w-full sm:w-44">
    <CustomSelect
      options={academicYears.map((y) => ({ label: y, value: y }))}
      value={selectedYear}
      onChange={setSelectedYear}
      placeholder="Select Year"
    />
  </div>

  {/* Refresh Button */}
  <div className="w-full sm:w-auto sm:ml-auto">
    <button
      onClick={fetchData}
      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-white text-sm font-medium shadow-md"
    >
      Refresh
    </button>
  </div>
</div>


      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-6">
  <MetricCard title="Present" value={totalPresent} pct={presentPct} bgColor="bg-green-800/70" />
  <MetricCard title="Absent" value={totalAbsent} pct={absentPct} bgColor="bg-red-800/70" />
  <MetricCard title="Late" value={totalLate} pct={latePct} bgColor="bg-yellow-700/70" />
  <MetricCard title="Total Records" value={totalStudents} bgColor="bg-gray-800/70" />
</div>

      {/* Detailed records */}
      <AttendanceDetails />

      {/* Chronic Absentees */}
      <div className="bg-gray-950 shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">
          Chronic Absentees (30 days)
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
                  <td className="px-4 py-2">
                    {s.firstName} {s.lastName}
                  </td>
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
