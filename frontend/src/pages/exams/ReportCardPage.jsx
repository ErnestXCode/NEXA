import React, { useState } from "react";
import api from "../../api/axios";

const ReportCardPage = () => {
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("");
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/exams/report/${studentId}/${term}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Report Card</h1>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="">Select Term</option>
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
        <button
          onClick={fetchReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Fetch
        </button>
      </div>

      {report && (
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            {report.student.name} ({report.student.classLevel} {report.student.stream})
          </h2>
          <h3 className="text-md mb-3">Results for {term}</h3>

          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2">Subject</th>
                <th className="p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {report.termResults.map((res) =>
                res.subjects.map((s, i) => (
                  <tr key={`${res.exam._id}-${i}`}>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-4">
            {report.termResults.map((res) => (
              <div key={res.exam._id} className="p-2 border-t">
                <strong>{res.exam.name}:</strong> Avg {res.average.toFixed(2)} | Grade {res.grade} {res.remark && `(${res.remark})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardPage;
