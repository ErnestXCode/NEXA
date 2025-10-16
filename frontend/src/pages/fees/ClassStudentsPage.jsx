// src/pages/admin/ClassStudentsPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudentsByClass = async ({ queryKey }) => {
  // Skip the first element ("classStudents")
  const [, classLevel, academicYear] = queryKey;

  const res = await api.get(
    `/fees/schools/class-students?classLevel=${encodeURIComponent(
      classLevel
    )}&academicYear=${encodeURIComponent(academicYear)}`
  );

  return res.data;
};

const ClassStudentsPage = () => {
  const location = useLocation();

  //   console.log('--------------',location.state, '-------------')
  const navigate = useNavigate();
  const { className, academicYear } = location.state || {};

  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["classStudents", className, academicYear],
    queryFn: fetchStudentsByClass,
    enabled: !!className && !!academicYear,
  });
  //   console.log('--------------',data, '-------------')

  const filteredStudents = data?.students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-200"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">
        📚 {className} - {academicYear}
      </h1>

      {/* Search */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search student by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-2 rounded bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading students...</p>
      ) : error ? (
        <p className="text-red-400">Failed to load students.</p>
      ) : filteredStudents?.length === 0 ? (
        <p className="text-green-400">No students found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="min-w-full border-collapse text-gray-200">
            <thead className="bg-gray-800/60 text-gray-300 text-sm uppercase tracking-wide">
              <tr>
                <th className="p-3 text-left border-b border-gray-700">
                  Student
                </th>
                <th className="p-3 text-right border-b border-gray-700">
                  Total Outstanding
                </th>
                <th className="p-3 text-center border-b border-gray-700">
                  Term Breakdown
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredStudents.map((s) => (
                <tr
                  key={s.studentId}
                  onClick={() => navigate(`/dashboard/debtors/${s.studentId}`)}
                  className="hover:bg-gray-800/50 cursor-pointer transition duration-150"
                >
                  <td className="p-3 font-semibold text-gray-100">{s.name}</td>
                  <td className="p-3 text-right font-bold text-red-400">
                    KES {s.totalOutstanding.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      {s.terms.map((t, i) => {
                        const termColor =
                          i === 0
                            ? "bg-blue-900/40 text-blue-300 border border-blue-800"
                            : i === 1
                            ? "bg-amber-900/40 text-amber-300 border border-amber-800"
                            : "bg-emerald-900/40 text-emerald-300 border border-emerald-800";

                        return (
                          <span
                            key={t.term}
                            className={`text-xs font-medium px-3 py-1 rounded-full ${termColor}`}
                          >
                            {t.term}:{" "}
                            <span className="font-semibold">
                              KES {t.outstanding.toLocaleString()}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassStudentsPage;
