// src/pages/admin/FeesPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";


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

const FeesPage = () => {
  const queryClient = useQueryClient();
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const navigate = useNavigate();



  // local state for new fee rule form
  const [newRule, setNewRule] = useState({
    academicYear,
    term: "Term 1",
    fromClass: "",
    toClass: "",
    amount: "",
  });

  /* ---------------- QUERIES ---------------- */
  const { data: schoolSummary, isLoading: loadingSummary } = useQuery({
    queryKey: ["schoolSummary", undefined, academicYear],
    queryFn: () =>
      fetcher(`/fees/schools/${undefined}/summary?academicYear=${academicYear}`),
  });

  const { data: schoolData } = useQuery({
    queryKey: ["school", "me"],
    queryFn: async () => {
      const res = await api.get(`/schools/me`);
      return res.data;
    },
  });



  const availableClasses = schoolData?.classLevels?.map((c) => c.name) || [];

  const { data: classSummary, isLoading: loadingClass } = useQuery({
    queryKey: ["classSummary", undefined, academicYear],
    queryFn: () =>
      fetcher(
        `/fees/schools/${undefined}/class-summary?academicYear=${academicYear}`
      ),
  });

  const { data: termComparison, isLoading: loadingComparison } = useQuery({
    queryKey: ["schoolTermComparison", undefined, academicYear],
    queryFn: () =>
      fetcher(
        `/fees/schools/${undefined}/term-comparison?academicYear=${academicYear}`
      ),
  });

  // inside FeesPage component
  const [debtorPage, setDebtorPage] = useState(1);
  const [debtorLimit] = useState(10); // default page size

  const [debtorFilterClass, setDebtorFilterClass] = useState("All");
  const [debtorSearch, setDebtorSearch] = useState("");
  const [debtorMinOutstanding, setDebtorMinOutstanding] = useState("");
  const [debtorMaxOutstanding, setDebtorMaxOutstanding] = useState("");

  const { data: debtors, isLoading: loadingDebtors } = useQuery({
    queryKey: [
      "debtors",
      undefined,
      academicYear,
      debtorPage,
      debtorLimit,
      debtorFilterClass,
      debtorSearch,
      debtorMinOutstanding,
      debtorMaxOutstanding,
    ],
    queryFn: () =>
      fetcher(
        `/fees/schools/${undefined}/debtors?academicYear=${academicYear}&page=${debtorPage}&limit=${debtorLimit}${
          debtorFilterClass !== "All"
            ? `&classLevel=${encodeURIComponent(debtorFilterClass)}`
            : ""
        }${debtorSearch ? `&search=${encodeURIComponent(debtorSearch)}` : ""}${
          debtorMinOutstanding ? `&minOutstanding=${debtorMinOutstanding}` : ""
        }${
          debtorMaxOutstanding ? `&maxOutstanding=${debtorMaxOutstanding}` : ""
        }`
      ),
    keepPreviousData: true,
  });

  const { data: feeRules, isLoading: loadingRules } = useQuery({
    queryKey: ["feeRules", undefined],
    queryFn: () => fetcher(`/schools/me`), // assuming GET /schools/:id returns feeRules
    select: (d) => d.feeRules || [],
  });

  // inside FeesPage component
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedClass, setSelectedClass] = useState("Grade 1");

  // term summary queries
  const { data: schoolTermSummary, isLoading: loadingSchoolTerm } = useQuery({
    queryKey: ["schoolTermSummary", undefined, academicYear, selectedTerm],
    queryFn: () =>
      fetcher(
        `/fees/schools/${undefined}/term-summary?academicYear=${academicYear}&term=${encodeURIComponent(
          selectedTerm
        )}`
      ),
  });

  const { data: classTermSummary, isLoading: loadingClassTerm } = useQuery({
    queryKey: [
      "classTermSummary",
      undefined,
      academicYear,
      selectedClass,
      selectedTerm,
    ],
    queryFn: () =>
      fetcher(
        `/fees/schools/${undefined}/class-term-summary?academicYear=${academicYear}&term=${encodeURIComponent(
          selectedTerm
        )}&className=${encodeURIComponent(selectedClass)}`
      ),
  });

  /* ---------------- MUTATION ---------------- */
  const updateRulesMutation = useMutation({
    mutationFn: async (rules) =>
      api.post(`/fees/schools/${undefined}/feerules`, { feeRules: rules }),
    onSuccess: () => {
      queryClient.invalidateQueries(["feeRules", undefined]);
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

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.delete(`/fees/fee-rules/${ruleId}`);
      queryClient.invalidateQueries(["feeRules", undefined]);
    } catch (err) {
      console.error("Failed to delete rule", err);
    }
  };

  console.log(classSummary);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      <h1 className="text-3xl font-extrabold">💰 Fees Dashboard</h1>

      {/* Academic Year first */}
      <section className="bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-md sticky top-0 z-10">
        <div>
          <label className="block text-gray-400 text-sm mb-1">
            Academic Year
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </section>

      <ChartCard title="🏫 School Fees Distribution">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Summary with bars */}
          <div className="flex-1 space-y-4">
            <div className="bg-gray-950 rounded-lg p-4 shadow flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Expected</p>
                <p className="text-xl font-bold text-blue-400">
                  KES {schoolSummary?.expected?.toLocaleString()}
                </p>
              </div>
              <div className="w-1/2 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-blue-500"
                  style={{
                    width: `${
                      ((schoolSummary?.paid || 0) / schoolSummary?.expected) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-950 rounded-lg p-4 shadow flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Paid</p>
                <p className="text-xl font-bold text-green-400">
                  KES {schoolSummary?.paid?.toLocaleString()}
                </p>
              </div>
              <div className="w-1/2 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-green-500"
                  style={{
                    width: `${
                      ((schoolSummary?.paid || 0) / schoolSummary?.expected) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-950 rounded-lg p-4 shadow flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Outstanding</p>
                <p className="text-xl font-bold text-red-400">
                  KES {schoolSummary?.outstanding?.toLocaleString()}
                </p>
              </div>
              <div className="w-1/2 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-red-500"
                  style={{
                    width: `${
                      ((schoolSummary?.outstanding || 0) /
                        schoolSummary?.expected) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Top Debtors */}
            <div className="mt-4 bg-gray-950/50 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-2 font-semibold">
                🚨 Top Debtors
              </p>
              {debtors?.debtors?.slice(0, 3).map((d) => (
                <div
                  key={d.studentId}
                  className="flex justify-between items-center text-sm text-gray-300 hover:bg-gray-700/40 rounded px-2 py-1"
                >
                  <span>
                    {d.name}{" "}
                    <span className="text-gray-400">({d.classLevel})</span>
                  </span>
                  <span className="text-red-400 font-semibold">
                    KES {d.totalOutstanding.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="w-full lg:w-1/3 h-90 flex flex-col items-center justify-center">
            {schoolSummary && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Paid", value: schoolSummary.paid },
                      { name: "Outstanding", value: schoolSummary.outstanding },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {[{ fill: "#4ade80" }, { fill: "#f87171" }].map(
                      (entry, index) => (
                        <Cell key={`cell-${index}`} {...entry} />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `KES ${v.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <p className="text-gray-400 text-sm mt-2">
              Paid vs Outstanding distribution
            </p>
          </div>
        </div>
      </ChartCard>

      {/* Fee Rules */}
      <section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6 space-y-4">
        <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">
          📏 Fee Rules
        </h2>

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
                {feeRules?.map((r) => (
                  <tr key={r._id} className="text-center hover:bg-gray-800/40">
                    <td className="border border-gray-700 p-2">
                      {r.academicYear}
                    </td>
                    <td className="border border-gray-700 p-2">{r.term}</td>
                    <td className="border border-gray-700 p-2">
                      {r.fromClass}
                    </td>
                    <td className="border border-gray-700 p-2">{r.toClass}</td>
                    <td className="border border-gray-700 p-2">
                      KES {r.amount}
                    </td>
                    <td className="border border-gray-700 p-2">
                      <button
                        onClick={() => handleDeleteRule(r._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ❌ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* add new rule form */}
        <div className="grid grid-cols-5 gap-2">
          <select
            value={newRule.fromClass}
            onChange={(e) =>
              setNewRule({ ...newRule, fromClass: e.target.value })
            }
            className="bg-gray-800 border border-gray-700 p-2 rounded"
          >
            <option value="">From Class</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={newRule.toClass}
            onChange={(e) =>
              setNewRule({ ...newRule, toClass: e.target.value })
            }
            className="bg-gray-800 border border-gray-700 p-2 rounded"
          >
            <option value="">To Class</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

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

      {/* Filters (Term + Class) */}
      <section className="bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-md sticky top-0 z-10">
        <div className="flex flex-wrap gap-6">
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
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Term + Class Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummarySection
          title={`🏫 School Term Summary (${selectedTerm})`}
          data={schoolTermSummary}
          loading={loadingSchoolTerm}
        />
        <SummarySection
          title={`📚 ${selectedClass} - ${selectedTerm}`}
          data={classTermSummary}
          loading={loadingClassTerm}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Fees Chart */}
        {/* Class Fees Chart */}
        {/* Class Fees Chart */}
        <ChartCard title="🏫 Class Fees Summary (Chart)">
          {loadingClass ? (
            <p className="text-gray-400">Loading class summary...</p>
          ) : classSummary && Object.keys(classSummary).length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(classSummary)
                    .sort(([aClass], [bClass]) => {
                      // 1️⃣ PP classes first
                      const ppRegex = /^PP(\d+)/i;
                      const gradeRegex = /(\d+)/;

                      const aPP = aClass.match(ppRegex);
                      const bPP = bClass.match(ppRegex);

                      if (aPP && bPP)
                        return parseInt(aPP[1]) - parseInt(bPP[1]);
                      if (aPP) return -1;
                      if (bPP) return 1;

                      // 2️⃣ Numeric grades next
                      const aNum = aClass.match(gradeRegex);
                      const bNum = bClass.match(gradeRegex);

                      if (aNum && bNum)
                        return parseInt(aNum[1]) - parseInt(bNum[1]);
                      if (aNum) return -1;
                      if (bNum) return 1;

                      // 3️⃣ Fallback: alphabetical
                      return aClass.localeCompare(bClass);
                    })
                    .map(([cls, terms]) => {
                      const totalPaid = Object.values(terms || {}).reduce(
                        (sum, t) => sum + (t.paid || 0),
                        0
                      );
                      const totalOutstanding = Object.values(
                        terms || {}
                      ).reduce((sum, t) => sum + (t.outstanding || 0), 0);
                      return {
                        class: cls,
                        Paid: totalPaid,
                        Outstanding: totalOutstanding,
                      };
                    })}
                  margin={{ top: 5, right: 20, left: 10, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="class"
                    stroke="#9ca3af"
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip formatter={(v) => `KES ${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="Paid" fill="#4ade80" />
                  <Bar dataKey="Outstanding" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400">No class summary data available.</p>
          )}
        </ChartCard>

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
                <Tooltip formatter={(v) => `KES ${v.toLocaleString()}`} />

                <Legend />
                <Bar dataKey="expected" fill="#60a5fa" />
                <Bar dataKey="paid" fill="#4ade80" />
                <Bar dataKey="outstanding" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
      {/* Class Fees Table */}
      {/* Class Fees Table */}
      {/* Class Fees Table */}
     <ChartCard title="🏫 Class Fees Summary">
  {loadingClass ? (
    <p className="text-gray-400 animate-pulse">Loading class summary...</p>
  ) : classSummary && Object.keys(classSummary).length > 0 ? (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 shadow-md">
      <table className="min-w-full border-collapse text-gray-200">
        <thead>
          <tr className="bg-gray-900/70 backdrop-blur-sm text-gray-300 text-sm uppercase tracking-wider">
            <th className="p-3 text-left border-b border-gray-700">Class</th>
            {["Term 1", "Term 2", "Term 3"].map((term, i) => (
              <th
                key={term}
                className={`p-3 text-center border-b border-gray-700 ${
                  i === 0
                    ? "text-blue-400"
                    : i === 1
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {term}
                <div className="text-xs text-gray-500 font-normal">
                  Paid / Outstanding
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-800">
          {Object.keys(classSummary)
            .sort((a, b) => {
              // Sort PP then Grades
              if (a.startsWith("PP") && b.startsWith("PP")) {
                return (
                  parseInt(a.replace(/\D/g, ""), 10) -
                  parseInt(b.replace(/\D/g, ""), 10)
                );
              }
              if (a.startsWith("PP")) return -1;
              if (b.startsWith("PP")) return 1;

              const numA = parseInt(a.replace(/\D/g, ""), 10);
              const numB = parseInt(b.replace(/\D/g, ""), 10);
              if (!isNaN(numA) && !isNaN(numB)) return numA - numB;

              return a.localeCompare(b);
            })
            .map((cls) => (
              <tr
                key={cls}
                className="hover:bg-gray-800/50 transition-colors duration-200"
              >
                {/* Class name */}
                <td className="p-3 font-semibold text-gray-100 border-r border-gray-800">
                  {cls}
                </td>

                {/* Each Term */}
                {["Term 1", "Term 2", "Term 3"].map((term, i) => {
                  const stats = classSummary[cls][term] || {
                    paid: 0,
                    outstanding: 0,
                  };

                  // Themed colors
                  const badgeColor =
                    i === 0
                      ? "bg-blue-900/40 text-blue-300 border border-blue-800"
                      : i === 1
                      ? "bg-amber-900/40 text-amber-300 border border-amber-800"
                      : "bg-emerald-900/40 text-emerald-300 border border-emerald-800";

                  return (
                    <td
                      key={term}
                      className="p-3 text-center border-r border-gray-800"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${badgeColor}`}
                        >
                           Paid:{" "}
                          <span className="font-semibold text-gray-100">
                            {stats.paid
                              ? `KES ${stats.paid.toLocaleString()}`
                              : "KES 0"}
                          </span>
                        </span>

                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${badgeColor.replace(
                            "/40",
                            "/20"
                          )} opacity-90 text-gray-400`}
                        >
                           Outstanding:{" "}
                          <span className="font-semibold text-gray-200">
                            {stats.outstanding
                              ? `KES ${stats.outstanding.toLocaleString()}`
                              : "KES 0"}
                          </span>
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-gray-400">No class summary data available.</p>
  )}
</ChartCard>


      {/* Debtors */}
      {/* Debtors */}
      {/* 🚨 Debtors Section */}
      <section className="bg-gray-900 rounded-2xl shadow border border-gray-800 p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🚨 Debtors List
          </h2>
          <span className="text-sm text-gray-400">
            {debtors?.totalDebtors
              ? `${debtors.totalDebtors} total debtors`
              : "—"}
          </span>
        </div>

        {/* 🔍 Debtors Filters */}
        <div className="bg-gray-800/60 p-4 rounded-xl mb-4 border border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Class Filter */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Class</label>
              <select
                value={debtorFilterClass}
                onChange={(e) => {
                  setDebtorFilterClass(e.target.value);
                  setDebtorPage(1);
                }}
                className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Classes</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Search by Name
              </label>
              <input
                type="text"
                value={debtorSearch}
                onChange={(e) => {
                  setDebtorSearch(e.target.value);
                  setDebtorPage(1);
                }}
                placeholder="Enter student name..."
                className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Min Outstanding */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Min Outstanding (KES)
              </label>
              <input
                type="number"
                value={debtorMinOutstanding}
                onChange={(e) => {
                  setDebtorMinOutstanding(e.target.value);
                  setDebtorPage(1);
                }}
                placeholder="e.g. 5000"
                className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Outstanding */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Max Outstanding (KES)
              </label>
              <input
                type="number"
                value={debtorMaxOutstanding}
                onChange={(e) => {
                  setDebtorMaxOutstanding(e.target.value);
                  setDebtorPage(1);
                }}
                placeholder="e.g. 20000"
                className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reset Filters */}
          <div className="mt-4 text-right">
            <button
              onClick={() => {
                setDebtorFilterClass("All");
                setDebtorSearch("");
                setDebtorMinOutstanding("");
                setDebtorMaxOutstanding("");
                setDebtorPage(1);
              }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {loadingDebtors ? (
          <p className="text-gray-400 animate-pulse">Loading debtors...</p>
        ) : debtors?.totalDebtors === 0 ? (
          <p className="text-green-400">🎉 All students are cleared!</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="min-w-full border-collapse text-gray-200">
                <thead className="bg-gray-800/60 text-gray-300 text-sm uppercase tracking-wide">
                  <tr>
                    <th className="p-3 text-left border-b border-gray-700">
                      Student
                    </th>
                    <th className="p-3 text-left border-b border-gray-700">
                      Class
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
                  {debtors.debtors.map((d, idx) => (
                    <tr
                      key={d.studentId}
                      onClick={() => navigate(`/dashboard/debtors/${d.studentId}`)}
                      className="hover:bg-gray-800/50 transition duration-150"
                    >
                      {/* Name */}
                      <td className="p-3 font-semibold text-gray-100">
                        {d.name}
                      </td>

                      {/* Class */}
                      <td className="p-3 text-gray-400">{d.classLevel}</td>

                      {/* Total Outstanding */}
                      <td className="p-3 text-right font-bold text-red-400">
                        KES {d.totalOutstanding.toLocaleString()}
                      </td>

                      {/* Term Breakdown */}
                      <td className="p-3 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          {d.terms.map((t, i) => {
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

            {/* Pagination */}
            <div className="flex justify-between items-center mt-5 text-sm text-gray-300">
              <span>
                Page {debtors.currentPage} of {debtors.totalPages}
              </span>
              <div className="space-x-2">
                <button
                  disabled={debtorPage === 1}
                  onClick={() => setDebtorPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40"
                >
                  ⬅ Prev
                </button>
                <button
                  disabled={debtorPage === debtors.totalPages}
                  onClick={() =>
                    setDebtorPage((p) => Math.min(p + 1, debtors.totalPages))
                  }
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40"
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
      <p className="text-xl font-bold">
        {`KES ${(value || 0).toLocaleString()}`}
      </p>
    </div>
  );
};
const SummarySection = ({ title, data, loading }) => (
  <section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6">
    <h2 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">
      {title}
    </h2>

    {loading ? (
      <p className="text-gray-400">Loading...</p>
    ) : (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <SummaryCard label="Expected" value={data?.expected} color="blue" />
          <SummaryCard label="Paid" value={data?.paid} color="green" />
          <SummaryCard
            label="Outstanding"
            value={data?.outstanding}
            color="red"
          />
        </div>

        {/* Chart below */}
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Paid", value: data?.paid || 0 },
                  { name: "Outstanding", value: data?.outstanding || 0 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, value }) =>
                  `${name}: KES ${value.toLocaleString()}`
                }
              >
                {[{ fill: "#4ade80" }, { fill: "#f87171" }].map(
                  (entry, index) => (
                    <Cell key={`cell-${index}`} {...entry} />
                  )
                )}
              </Pie>
              <Tooltip formatter={(v) => `KES ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </>
    )}
  </section>
);

const ChartCard = ({ title, children }) => (
  <section className="bg-gray-900 rounded-xl shadow border border-gray-800 p-6">
    <h2 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">
      {title}
    </h2>
    {children}
  </section>
);
