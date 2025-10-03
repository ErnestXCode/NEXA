import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const AttendanceLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    academicYear: new Date().getFullYear(),
    term: "Term 1",
    classLevel: "",
    status: "",
    search: "",
    page: 1,
    limit: 50,
  });
  const [total, setTotal] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState({});

  const terms = ["Term 1", "Term 2", "Term 3"];
  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setAcademicYears([currentYear, currentYear - 1, currentYear - 2]);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/attendance/logs", { params: filters });
      setLogs(res.data.records);
      setTotal(res.data.total);
      const levels = [...new Set(res.data.records.map((r) => r.classLevel))];
      setClassLevels(levels);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  // Group logs by date + classLevel + markedBy
  const groupedLogs = logs.reduce((acc, log) => {
    const key = `${log.date}-${log.classLevel}-${log.markedBy?.name || "N/A"}`;
    if (!acc[key]) acc[key] = { meta: log, records: [] };
    acc[key].records.push(log);
    return acc;
  }, {});

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="p-4 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Attendance Logs / Audit</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value, page: 1 }))}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <select
          value={filters.academicYear}
          onChange={(e) => setFilters((prev) => ({ ...prev, academicYear: e.target.value, page: 1 }))}
          className="p-2 rounded bg-gray-800 text-white"
        >
          {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filters.term}
          onChange={(e) => setFilters((prev) => ({ ...prev, term: e.target.value, page: 1 }))}
          className="p-2 rounded bg-gray-800 text-white"
        >
          {terms.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filters.classLevel}
          onChange={(e) => setFilters((prev) => ({ ...prev, classLevel: e.target.value, page: 1 }))}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="">All Classes</option>
          {classLevels.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
        <input
          type="text"
          placeholder="Search student..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          className="p-2 rounded bg-gray-800 text-white"
        />
      </div>

      {/* Grouped Logs */}
      <div className="space-y-2">
        {Object.entries(groupedLogs).map(([key, group]) => {
          const { meta, records } = group;
          const isExpanded = expandedGroups[key];
          return (
            <div key={key} className="bg-gray-900 rounded shadow">
              <button
                onClick={() => toggleGroup(key)}
                className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-800 transition-colors"
              >
                <span>
                  <strong>{meta.classLevel}</strong> - {new Date(meta.date).toLocaleDateString()} | Marked by: {meta.markedBy?.name || "N/A"}
                </span>
                <span>{records.length} student{records.length > 1 ? "s" : ""}</span>
              </button>
              {isExpanded && (
                <table className="w-full text-sm border-collapse text-left">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="p-2">Student</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-800">
                        <td className="p-2">{r.student?.firstName} {r.student?.lastName}</td>
                        <td className="p-2">{r.status}</td>
                        <td className="p-2">{r.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-center p-4 text-gray-400">No records found.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={filters.page <= 1}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {filters.page} of {Math.ceil(total / filters.limit)}</span>
        <button
          disabled={filters.page >= Math.ceil(total / filters.limit)}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default AttendanceLogsPage;
