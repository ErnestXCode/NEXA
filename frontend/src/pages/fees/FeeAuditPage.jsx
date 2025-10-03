import React, { useState } from "react";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const FeeAuditPage = () => {
  const [filters, setFilters] = useState({
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    term: "",
    classLevel: "",
  });

 const { data: transactions = [], isLoading, refetch } = useQuery({
  queryKey: ["feeTransactions", filters],
  queryFn: async () => {
    const params = {};
    if (filters.academicYear) params.academicYear = filters.academicYear;
    if (filters.term) params.term = filters.term;
    if (filters.classLevel) params.classLevel = filters.classLevel;
    const res = await api.get("/fees/transactions/all", { params });
    return res.data;
  },
  keepPreviousData: true,
});


  const terms = ["Term 1", "Term 2", "Term 3"];

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6">💰 Fee Transactions Audit</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Academic Year"
          value={filters.academicYear}
          onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />

        <select
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">All Terms</option>
          {terms.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Class Level"
          value={filters.classLevel}
          onChange={(e) => setFilters({ ...filters, classLevel: e.target.value })}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />

        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {isLoading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-800 rounded text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2">Student</th>
                <th className="p-2">Class</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Type</th>
                <th className="p-2">Term</th>
                <th className="p-2">Academic Year</th>
                <th className="p-2">Method</th>
                <th className="p-2">Handled By</th>
                <th className="p-2">Note</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-t border-gray-800">
                  <td className="p-2">{t.student?.firstName} {t.student?.lastName}</td>
                  <td className="p-2">{t.student?.classLevel}</td>
                  <td className="p-2">KSh {t.amount}</td>
                  <td className="p-2">{t.type}</td>
                  <td className="p-2">{t.term}</td>
                  <td className="p-2">{t.academicYear}</td>
                  <td className="p-2">{t.method}</td>
                  <td className="p-2">{t.handledBy?.name || "N/A"}</td>
                  <td className="p-2">{t.note || "-"}</td>
                  <td className="p-2">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeAuditPage;
