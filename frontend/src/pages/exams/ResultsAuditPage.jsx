import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const ResultsAuditPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    examId: "",
    classLevel: "",
    academicYear: "",
    term: "",
  });
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const terms = ["Term 1", "Term 2", "Term 3"];
  const [academicYears, setAcademicYears] = useState([]);

  useEffect(() => {
    const now = new Date();
    setAcademicYears([now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]);

    const fetchExams = async () => {
      const res = await api.get("/exams");
      setExams(res.data || []);
    };
    const fetchClasses = async () => {
      const res = await api.get("/students/classes");
      setClasses(res.data || []);
    };

    fetchExams();
    fetchClasses();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get("/exams/results/audit", { params: filters });
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Results Audit Logs</h1>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.examId}
          onChange={(e) => setFilters((f) => ({ ...f, examId: e.target.value }))}
          className="p-2 bg-gray-800 text-white rounded"
        >
          <option value="">All Exams</option>
          {exams.map((e) => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>

        <select
          value={filters.classLevel}
          onChange={(e) => setFilters((f) => ({ ...f, classLevel: e.target.value }))}
          className="p-2 bg-gray-800 text-white rounded"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.term}
          onChange={(e) => setFilters((f) => ({ ...f, term: e.target.value }))}
          className="p-2 bg-gray-800 text-white rounded"
        >
          <option value="">All Terms</option>
          {terms.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.academicYear}
          onChange={(e) => setFilters((f) => ({ ...f, academicYear: e.target.value }))}
          className="p-2 bg-gray-800 text-white rounded"
        >
          <option value="">All Years</option>
          {academicYears.map((y) => (
            <option key={y} value={`${y}/${y+1}`}>{y}/{y+1}</option>
          ))}
        </select>
      </div>

      <div className="overflow-auto max-h-[70vh] bg-gray-900 rounded p-2">
        <table className="min-w-full text-left border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">Student</th>
              <th className="p-2">Class</th>
              <th className="p-2">Subjects</th>
              <th className="p-2">Recorded By</th>
              <th className="p-2">Recorded At</th>
            </tr>
          </thead>
         <tbody>
  {auditLogs.map((log, i) => (
    <tr
      key={i}
      className={`border-t border-gray-700 hover:bg-gray-800 transition-colors ${
        i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
      }`}
    >
      <td className="p-2 font-semibold">{log.student}</td>
      <td className="p-2">{log.classLevel}</td>
      <td className="p-2">
       <td className="p-2">
  <div className="max-h-24 overflow-y-auto flex flex-wrap gap-1">
    {log.subjects.map((s, idx) => (
      <div
        key={idx}
        className="bg-gray-800 text-white px-1 py-0.5 rounded flex justify-between items-center text-xs"
        style={{ minWidth: "60px" }}
      >
        <span className="font-medium truncate">{s.name}</span>
        <span className="ml-1 font-semibold">{s.score}</span>
      </div>
    ))}
  </div>
</td>

      </td>
    
      <td className="p-2 text-gray-400">{log.recordedBy}</td>
      <td className="p-2 text-gray-400">{new Date(log.recordedAt).toLocaleString()}</td>
    </tr>
  ))}
  {auditLogs.length === 0 && (
    <tr>
      <td colSpan="5" className="p-4 text-center text-gray-400">
        No audit logs found
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default ResultsAuditPage;
