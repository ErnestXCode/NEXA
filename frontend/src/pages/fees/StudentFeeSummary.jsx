import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudentSummary = async ({ queryKey }) => {
  const [, studentId] = queryKey;
  const res = await api.get(`/fees/students/${studentId}/summary`);
  console.log(res.data, '---------------------------')
  return res.data;
};

const StudentFeeSummary = ({ studentId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentSummary", studentId],
    queryFn: fetchStudentSummary,
    enabled: !!studentId,
  });

  if (!studentId) return null;
  if (isLoading) return <p className="text-gray-400 animate-pulse">Loading fee summary...</p>;
  if (error) return <p className="text-red-400">Failed to load fee summary.</p>;

  const { name, classLevel, totalOutstanding, terms } = data;

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-md text-gray-100">
      <h2 className="text-xl font-bold mb-2">💰 Fee Summary</h2>
      <p className="text-gray-400 text-sm mb-4">
        {name} – {classLevel}
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {terms.map((t, i) => {
          const termColor =
            i === 0
              ? "bg-blue-900/40 text-blue-300 border border-blue-800"
              : i === 1
              ? "bg-amber-900/40 text-amber-300 border border-amber-800"
              : "bg-emerald-900/40 text-emerald-300 border border-emerald-800";

          return (
            <div
              key={t.term}
              className={`text-xs font-medium px-4 py-2 rounded-full ${termColor}`}
            >
              {t.term}:{" "}
              <span
                className={`font-semibold ${
                  t.outstanding > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                KES {t.outstanding.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-right border-t border-gray-800 pt-4">
        <p className="text-lg font-bold">
          Total Outstanding:{" "}
          <span
            className={totalOutstanding > 0 ? "text-red-400" : "text-green-400"}
          >
            KES {totalOutstanding.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
};

export default StudentFeeSummary;
