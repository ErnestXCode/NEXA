// src/pages/admin/DebtorHistoryPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import dayjs from "dayjs";

const fetchHistory = async (studentId) => {
  const res = await api.get(`/fees/students/${studentId}/history`);
  return res.data;
};

const DebtorHistoryPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["debtorHistory", studentId],
    queryFn: () => fetchHistory(studentId),
  });

  if (isLoading)
    return <div className="text-gray-400 p-6">Loading history...</div>;
  if (error)
    return <div className="text-red-400 p-6">Error loading history</div>;

  const student = data?.student;
  const transactions = data?.transactions || [];
  const totals = data?.totals || {};
  const totalPaid = (totals.paid || 0) + (totals.adjustments || 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
      >
        ← Back
      </button>

      {/* Student Info */}
      <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800 shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">
          {student?.name}{" "}
          <span className="text-gray-400">({student?.classLevel})</span>
        </h1>
        <p className="text-sm text-gray-400">
          Total Transactions: {data.totalTransactions}
        </p>
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400 text-sm">Total Paid</p>
          <p className="text-green-400 text-lg sm:text-xl font-semibold">
            KES {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400 text-sm">Adjustments</p>
          <p className="text-yellow-400 text-lg sm:text-xl font-semibold">
            KES {totals.adjustments?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800 shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold border-b border-gray-800 pb-2 mb-4">
          📜 All Transactions
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm sm:text-base">
            No transactions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-gray-200 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-800 text-gray-300 text-xs sm:text-sm uppercase tracking-wider">
                  <th className="p-3 text-left border-b border-gray-700">Date</th>
                  <th className="p-3 text-left border-b border-gray-700">Academic Year</th>
                  <th className="p-3 text-left border-b border-gray-700">Term</th>
                  <th className="p-3 text-left border-b border-gray-700">Type</th>
                  <th className="p-3 text-left border-b border-gray-700">Amount</th>
                  <th className="p-3 text-left border-b border-gray-700">Method</th>
                  <th className="p-3 text-left border-b border-gray-700">Handled By</th>
                  <th className="p-3 text-left border-b border-gray-700">Note</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-gray-800/50 transition border-b border-gray-800"
                  >
                    <td className="p-3">{dayjs(t.createdAt).format("DD MMM YYYY")}</td>
                    <td className="p-3">{t.academicYear}</td>
                    <td className="p-3">{t.term}</td>
                    <td className="p-3 capitalize">{t.type}</td>
                    <td
                      className={`p-3 font-semibold ${
                        t.type === "fine"
                          ? "text-red-400"
                          : t.type === "adjustment"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      KES {t.amount.toLocaleString()}
                    </td>
                    <td className="p-3 capitalize">{t.method}</td>
                    <td className="p-3">{t.handledBy?.name || "—"}</td>
                    <td className="p-3">{t.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtorHistoryPage;
