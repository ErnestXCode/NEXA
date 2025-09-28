// src/pages/admin/FeesPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

// fetcher helper
const fetcher = async (url) => {
  const res = await api.get(url);
  return res.data;
};

const FeesPage = ({ schoolId }) => {
  const queryClient = useQueryClient();
  const [academicYear, setAcademicYear] = useState("2025/2026");

  // local state for new fee rule form
  const [newRule, setNewRule] = useState({
    academicYear: "2025/2026",
    term: "Term 1",
    fromClass: "",
    toClass: "",
    amount: "",
  });

  /* ---------------- QUERIES ---------------- */
  const { data: schoolSummary, isLoading: loadingSummary } = useQuery({
    queryKey: ["schoolSummary", schoolId, academicYear],
    queryFn: () =>
      fetcher(`/fees/schools/${schoolId}/summary?academicYear=${academicYear}`),
  });

  const { data: classSummary, isLoading: loadingClass } = useQuery({
    queryKey: ["classSummary", schoolId, academicYear],
    queryFn: () =>
      fetcher(
        `/fees/schools/${schoolId}/class-summary?academicYear=${academicYear}`
      ),
  });

  const { data: debtors, isLoading: loadingDebtors } = useQuery({
    queryKey: ["debtors", schoolId, academicYear],
    queryFn: () =>
      fetcher(`/fees/schools/${schoolId}/debtors?academicYear=${academicYear}`),
  });

  const { data: feeRules, isLoading: loadingRules } = useQuery({
    queryKey: ["feeRules", schoolId],
    queryFn: () => fetcher(`/schools/${schoolId}`), // assuming GET /schools/:id returns feeRules
    select: (d) => d.feeRules || [],
  });

  /* ---------------- MUTATION ---------------- */
  const updateRulesMutation = useMutation({
    mutationFn: async (rules) =>
      api.post(`/fees/schools/${schoolId}/feerules`, { feeRules: rules }),
    onSuccess: () => {
      queryClient.invalidateQueries(["feeRules", schoolId]);
    },
  });

  const addRule = () => {
    if (!newRule.fromClass || !newRule.toClass || !newRule.amount) {
      alert("Please fill all fields");
      return;
    }
    const updatedRules = [...(feeRules || []), { ...newRule, amount: +newRule.amount }];
    updateRulesMutation.mutate(updatedRules);
    setNewRule({ academicYear, term: "Term 1", fromClass: "", toClass: "", amount: "" });
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen text-gray-100">
      <h1 className="text-2xl font-bold">💰 Fees Dashboard</h1>

      {/* Academic year filter */}
      <div className="flex items-center gap-2">
        <label className="font-medium text-gray-300">Academic Year:</label>
        <input
          type="text"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="bg-gray-900 border border-gray-700 px-2 py-1 rounded text-gray-100 focus:outline-none focus:ring focus:ring-blue-600"
        />
      </div>

      {/* ---------------- FEE RULES ---------------- */}
      <section className="p-4 bg-gray-900 rounded-lg shadow border border-gray-800">
        <h2 className="text-xl font-semibold mb-3">📏 Fee Rules</h2>

        {loadingRules ? (
          <p className="text-gray-400">Loading rules...</p>
        ) : (
          <table className="w-full border border-gray-700 text-gray-200 mb-4">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-2 border border-gray-700">Year</th>
                <th className="p-2 border border-gray-700">Term</th>
                <th className="p-2 border border-gray-700">From Class</th>
                <th className="p-2 border border-gray-700">To Class</th>
                <th className="p-2 border border-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {feeRules?.map((r, i) => (
                <tr key={i} className="text-center">
                  <td className="border border-gray-700 p-2">{r.academicYear}</td>
                  <td className="border border-gray-700 p-2">{r.term}</td>
                  <td className="border border-gray-700 p-2">{r.fromClass}</td>
                  <td className="border border-gray-700 p-2">{r.toClass}</td>
                  <td className="border border-gray-700 p-2">KES {r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* add new rule form */}
        <div className="grid grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="From Class"
            value={newRule.fromClass}
            onChange={(e) => setNewRule({ ...newRule, fromClass: e.target.value })}
            className="bg-gray-800 border border-gray-700 p-2 rounded"
          />
          <input
            type="text"
            placeholder="To Class"
            value={newRule.toClass}
            onChange={(e) => setNewRule({ ...newRule, toClass: e.target.value })}
            className="bg-gray-800 border border-gray-700 p-2 rounded"
          />
          <select
            value={newRule.term}
            onChange={(e) => setNewRule({ ...newRule, term: e.target.value })}
            className="bg-gray-800 border border-gray-700 p-2 rounded"
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={newRule.amount}
            onChange={(e) => setNewRule({ ...newRule, amount: e.target.value })}
            className="bg-gray-800 border border-gray-700 p-2 rounded"
          />
          <button
            onClick={addRule}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
          >
            ➕ Add Rule
          </button>
        </div>
      </section>

      {/* ---------------- SCHOOL SUMMARY ---------------- */}
        <div className="p-6 space-y-6 bg-gray-950 min-h-screen text-gray-100">
      <h1 className="text-2xl font-bold">💰 Fees Dashboard</h1>

      {/* Academic year filter */}
      <div className="flex items-center gap-2">
        <label className="font-medium text-gray-300">Academic Year:</label>
        <input
          type="text"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="bg-gray-900 border border-gray-700 px-2 py-1 rounded text-gray-100 focus:outline-none focus:ring focus:ring-blue-600"
        />
      </div>

      {/* ---------------- SCHOOL SUMMARY ---------------- */}
      <section className="p-4 bg-gray-900 rounded-lg shadow border border-gray-800">
        <h2 className="text-xl font-semibold mb-3">🏫 School Summary</h2>
        {loadingSummary ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-900/30 rounded">
              <p className="text-gray-400">Expected</p>
              <p className="text-lg font-bold text-blue-400">
                KES {schoolSummary?.expected || 0}
              </p>
            </div>
            <div className="p-3 bg-green-900/30 rounded">
              <p className="text-gray-400">Paid</p>
              <p className="text-lg font-bold text-green-400">
                KES {schoolSummary?.paid || 0}
              </p>
            </div>
            <div className="p-3 bg-red-900/30 rounded">
              <p className="text-gray-400">Outstanding</p>
              <p className="text-lg font-bold text-red-400">
                KES {schoolSummary?.outstanding || 0}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- CLASS SUMMARY ---------------- */}
      <section className="p-4 bg-gray-900 rounded-lg shadow border border-gray-800">
        <h2 className="text-xl font-semibold mb-3">📚 Class Breakdown</h2>
        {loadingClass ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <table className="w-full border border-gray-700 text-gray-200">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-2 border border-gray-700">Class</th>
                <th className="p-2 border border-gray-700">Expected</th>
                <th className="p-2 border border-gray-700">Paid</th>
                <th className="p-2 border border-gray-700">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(classSummary || {}).map(([classLevel, stats]) => (
                <tr key={classLevel} className="text-center">
                  <td className="border border-gray-700 p-2">{classLevel}</td>
                  <td className="border border-gray-700 p-2 text-blue-400">
                    KES {stats.expected}
                  </td>
                  <td className="border border-gray-700 p-2 text-green-400">
                    KES {stats.paid}
                  </td>
                  <td className="border border-gray-700 p-2 text-red-400">
                    KES {stats.outstanding}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ---------------- DEBTORS ---------------- */}
      <section className="p-4 bg-gray-900 rounded-lg shadow border border-gray-800">
        <h2 className="text-xl font-semibold mb-3">🚨 Debtors List</h2>
        {loadingDebtors ? (
          <p className="text-gray-400">Loading...</p>
        ) : debtors?.length === 0 ? (
          <p className="text-green-400">🎉 No debtors!</p>
        ) : (
          <table className="w-full border border-gray-700 text-gray-200">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-2 border border-gray-700">Student</th>
                <th className="p-2 border border-gray-700">Class</th>
                <th className="p-2 border border-gray-700">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((d) => (
                <tr key={d.studentId} className="text-center">
                  <td className="border border-gray-700 p-2">{d.name}</td>
                  <td className="border border-gray-700 p-2">{d.classLevel}</td>
                  <td className="border border-gray-700 p-2 text-red-400">
                    KES {d.outstanding}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
    </div>
  );
};

export default FeesPage;
