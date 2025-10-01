// src/pages/admin/FeesPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";


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

  const { data: termComparison, isLoading: loadingComparison } = useQuery({
  queryKey: ["schoolTermComparison", schoolId, academicYear],
  queryFn: () =>
    fetcher(
      `/fees/schools/${schoolId}/term-comparison?academicYear=${academicYear}`
    ),
});


  // inside FeesPage component
const [debtorPage, setDebtorPage] = useState(1);
const [debtorLimit] = useState(10); // default page size

const { data: debtors, isLoading: loadingDebtors } = useQuery({
  queryKey: ["debtors", schoolId, academicYear, debtorPage, debtorLimit],
  queryFn: () =>
    fetcher(
      `/fees/schools/${schoolId}/debtors?academicYear=${academicYear}&page=${debtorPage}&limit=${debtorLimit}`
    ),
  keepPreviousData: true,
});

const ALL_CLASSES = [
  "PP1",
  "PP2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

const chartData = ALL_CLASSES.map((cls) => ({
  class: cls,
  Paid: classSummary?.[cls]?.paid || 0,
  Outstanding: classSummary?.[cls]?.outstanding || 0,
}));



  const { data: feeRules, isLoading: loadingRules } = useQuery({
    queryKey: ["feeRules", schoolId],
    queryFn: () => fetcher(`/schools/me`), // assuming GET /schools/:id returns feeRules
    select: (d) => d.feeRules || [],
  });

  // inside FeesPage component
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedClass, setSelectedClass] = useState("Grade 1");

  // term summary queries
  const { data: schoolTermSummary, isLoading: loadingSchoolTerm } = useQuery({
    queryKey: ["schoolTermSummary", schoolId, academicYear, selectedTerm],
    queryFn: () =>
      fetcher(
        `/fees/schools/${schoolId}/term-summary?academicYear=${academicYear}&term=${encodeURIComponent(
          selectedTerm
        )}`
      ),
  });

  const { data: classTermSummary, isLoading: loadingClassTerm } = useQuery({
    queryKey: [
      "classTermSummary",
      schoolId,
      academicYear,
      selectedClass,
      selectedTerm,
    ],
    queryFn: () =>
      fetcher(
        `/fees/schools/${schoolId}/class-term-summary?academicYear=${academicYear}&term=${encodeURIComponent(
          selectedTerm
        )}&className=${encodeURIComponent(selectedClass)}`
      ),
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
    const updatedRules = [
      ...(feeRules || []),
      { ...newRule, amount: +newRule.amount },
    ];
    updateRulesMutation.mutate(updatedRules);
    setNewRule({
      academicYear,
      term: "Term 1",
      fromClass: "",
      toClass: "",
      amount: "",
    });
  };

  console.log(classSummary)

  /* ---------------- RENDER ---------------- */
 return (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
    <h1 className="text-3xl font-extrabold">💰 Fees Dashboard</h1>

    {/* Filters */}
    <section className="bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-md sticky top-0 z-10">
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Academic Year</label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Class</label>
          <input
            type="text"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            placeholder="e.g. Grade 4"
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
    </section>

    {/* Fee Rules */}
    <section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6 space-y-4">
      <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">📏 Fee Rules</h2>

      {loadingRules ? (
        <p className="text-gray-400">Loading rules...</p>
      ) : (
        <div className="overflow-x-auto">
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
                <tr key={i} className="text-center hover:bg-gray-800/40">
                  <td className="border border-gray-700 p-2">{r.academicYear}</td>
                  <td className="border border-gray-700 p-2">{r.term}</td>
                  <td className="border border-gray-700 p-2">{r.fromClass}</td>
                  <td className="border border-gray-700 p-2">{r.toClass}</td>
                  <td className="border border-gray-700 p-2">KES {r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

    {/* Summaries */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SummarySection title="🏫 School Summary" data={schoolSummary} loading={loadingSummary} />
      <SummarySection title={`🏫 School Term Summary (${selectedTerm})`} data={schoolTermSummary} loading={loadingSchoolTerm} />
      <SummarySection title={`📚 ${selectedClass} - ${selectedTerm}`} data={classTermSummary} loading={loadingClassTerm} />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="School Fees Distribution">
        {schoolSummary && (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Paid", value: schoolSummary.paid },
                  { name: "Outstanding", value: schoolSummary.outstanding },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label
              >
                <Cell fill="#4ade80" /> {/* green */}
                <Cell fill="#f87171" /> {/* red */}
              </Pie>
              <Tooltip formatter={(v) => `KES ${v}`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    <ChartCard title="📊 Class Breakdown">
  {classSummary && (
    <ResponsiveContainer width="100%" height={250}>
     <BarChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
  <XAxis
  dataKey="class"
  stroke="#9ca3af"
  interval={0}          // <- force show all ticks
  tick={{ fontSize: 12 }} // optional: shrink font to avoid overlap
/>

  <YAxis stroke="#9ca3af" />
  <Tooltip formatter={(v) => `KES ${v}`} />
  <Legend />
  <Bar dataKey="Paid" stackId="a" fill="#4ade80" />
  <Bar dataKey="Outstanding" stackId="a" fill="#f87171" />
</BarChart>

    </ResponsiveContainer>
  )}
</ChartCard>

    </div>

    {/* Extra chart - term comparison */}
   <ChartCard title="📈 Term Comparison">
  {loadingComparison ? (
    <p className="text-gray-400">Loading...</p>
  ) : (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={termComparison || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="term" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip formatter={(v) => `KES ${v}`} />
        <Legend />
        <Bar dataKey="expected" fill="#60a5fa" />
        <Bar dataKey="paid" fill="#4ade80" />
        <Bar dataKey="outstanding" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  )}
</ChartCard>


    {/* Class Breakdown Table */}
    <section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">📚 Class Breakdown</h2>
      <table className="w-full border-collapse">
        <thead className="bg-gray-800">
          <tr>
            {["Class", "Expected", "Paid", "Outstanding"].map((h) => (
              <th key={h} className="px-4 py-2 text-left text-gray-300">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(classSummary || {}).map(([classLevel, stats], idx) => (
            <tr
              key={classLevel}
              className={`${idx % 2 === 0 ? "bg-gray-950/40" : "bg-gray-900/40"} hover:bg-gray-800/60`}
            >
              <td className="px-4 py-2">{classLevel}</td>
              <td className="px-4 py-2 text-blue-400">KES {stats.expected}</td>
              <td className="px-4 py-2 text-green-400">KES {stats.paid}</td>
              <td className="px-4 py-2 text-red-400">KES {stats.outstanding}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    {/* Debtors */}
   {/* Debtors */}
<section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6 overflow-x-auto">
  <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">
    🚨 Debtors List
  </h2>

  {loadingDebtors ? (
    <p className="text-gray-400">Loading...</p>
  ) : debtors?.totalDebtors === 0 ? (
    <p className="text-green-400">🎉 No debtors!</p>
  ) : (
    <>
      <table className="w-full border-collapse">
        <thead className="bg-gray-800">
          <tr>
            {["Student", "Class", "Outstanding"].map((h) => (
              <th key={h} className="px-4 py-2 text-left text-gray-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {debtors.debtors.map((d, idx) => (
            <tr
              key={d.studentId}
              className={`${
                idx % 2 === 0 ? "bg-gray-950/40" : "bg-gray-900/40"
              } hover:bg-gray-800/60`}
            >
              <td className="px-4 py-2">{d.name}</td>
              <td className="px-4 py-2">{d.classLevel}</td>
             <td className="px-4 py-2 text-red-400">
  KES {d.totalOutstanding}
  <div className="text-xs text-gray-400 mt-1">
    {d.terms.map((t) => (
      <div key={t.term}>
        {t.term}: KES {t.outstanding}
      </div>
    ))}
  </div>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-300">
        <span>
          Page {debtors.currentPage} of {debtors.totalPages}
        </span>
        <div className="space-x-2">
          <button
            disabled={debtorPage === 1}
            onClick={() => setDebtorPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            ⬅ Prev
          </button>
          <button
            disabled={debtorPage === debtors.totalPages}
            onClick={() =>
              setDebtorPage((p) => Math.min(p + 1, debtors.totalPages))
            }
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      </div>
    </>
  )}
</section>

  </div>
);


};

export default FeesPage;

const SummaryCard = ({ label, value, color }) => {
  const colorMap = {
    blue: "text-blue-400 bg-blue-900/30",
    green: "text-green-400 bg-green-900/30",
    red: "text-red-400 bg-red-900/30",
  };

  return (
    <div className={`p-4 rounded-lg ${colorMap[color]} shadow-sm`}>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-xl font-bold">{value ? `KES ${value}` : "KES 0"}</p>
    </div>
  );
};
const SummarySection = ({ title, data, loading }) => (
  <section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6">
    <h2 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">{title}</h2>
    {loading ? (
      <p className="text-gray-400">Loading...</p>
    ) : (
      <div className="grid grid-cols-3 gap-4 text-center">
        <SummaryCard label="Expected" value={data?.expected} color="blue" />
        <SummaryCard label="Paid" value={data?.paid} color="green" />
        <SummaryCard label="Outstanding" value={data?.outstanding} color="red" />
      </div>
    )}
  </section>
);

const ChartCard = ({ title, children }) => (
  <section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6">
    <h2 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">{title}</h2>
    {children}
  </section>
);

