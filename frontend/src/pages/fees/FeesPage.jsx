import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const FeesPage = () => {
  const [students, setStudents] = useState([]);
  const [school, setSchool] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedClass, setSelectedClass] = useState("All");
  const [onlyWithBalance, setOnlyWithBalance] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 search input
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    fetchStudents();
    fetchSchool();
  }, []);

  useEffect(() => {
    fetchOutstanding();
  }, [selectedTerm, selectedClass]);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchSchool = async () => {
    try {
      const res = await api.get("/schools/me");
      setSchool(res.data);
    } catch (err) {
      console.error("Error fetching school:", err);
    }
  };

  const fetchOutstanding = async () => {
    try {
      let query = `?term=${selectedTerm}`;
      if (selectedClass !== "All") query += `&classLevel=${selectedClass}`;
      const res = await api.get(`/fees/outstanding${query}`);
      setTotalOutstanding(res.data.totalOutstanding || 0);
    } catch (err) {
      console.error("Error fetching outstanding fees:", err);
    }
  };

  const getStudentBalance = (student) => {
    if (!school) return 0;

    let expectations = [];

    if (Array.isArray(school.feeRules) && school.feeRules.length) {
      const idx = school.classLevels.findIndex(
        (c) => c.name === student.classLevel
      );

      const matchedRules = school.feeRules.filter((rule) => {
        const fromIdx = school.classLevels.findIndex(
          (c) => c.name === rule.fromClass
        );
        const toIdx = school.classLevels.findIndex(
          (c) => c.name === rule.toClass
        );
        if (idx === -1 || fromIdx === -1 || toIdx === -1) return false;
        const min = Math.min(fromIdx, toIdx);
        const max = Math.max(fromIdx, toIdx);
        return idx >= min && idx <= max && rule.term === selectedTerm;
      });

      if (matchedRules.length) expectations = matchedRules;
    }

    if (!expectations.length) {
      const classDef = (school.classLevels || []).find(
        (c) => c.name === student.classLevel
      );
      if (classDef && Array.isArray(classDef.feeExpectations)) {
        expectations = classDef.feeExpectations.filter(
          (f) => f.term === selectedTerm
        );
      }
    }

    if (!expectations.length) {
      expectations = (school.feeExpectations || []).filter(
        (f) => f.term === selectedTerm
      );
    }

    const expected = expectations[0]?.amount || 0;

    const payments = student.payments
      .filter((p) => p.term === selectedTerm && p.category === "payment")
      .reduce((sum, p) => sum + p.amount, 0);

    const adjustments = student.payments
      .filter((p) => p.term === selectedTerm && p.category === "adjustment")
      .reduce((sum, p) => sum + p.amount, 0);

    return expected - payments + adjustments;
  };

  const getBalanceColor = (balance) => {
    if (balance === 0) return "text-green-400"; // fully paid
    if (balance > 0) return "text-red-400"; // owes money
    return "text-yellow-400"; // overpaid
  };

  const classLevels = ["All", ...new Set(students.map((s) => s.classLevel))];

  const filteredStudents = students.filter((s) => {
    const balance = getStudentBalance(s);
    const classMatch =
      selectedClass === "All" || s.classLevel === selectedClass;
    const balanceMatch = !onlyWithBalance || balance > 0;
    const nameMatch = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()); // 🔹 name filter
    return classMatch && balanceMatch && nameMatch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-950 text-gray-100 rounded-lg shadow-lg mt-6 overflow-hidden">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">
        Student Fees - {selectedTerm}
      </h2>

      {/* Filters */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Term Selector */}
  <div className="bg-gray-900 p-4 rounded-lg shadow-md">
    <label className="block mb-2 text-sm font-medium text-gray-300">
      Select Term
    </label>
    <select
      value={selectedTerm}
      onChange={(e) => setSelectedTerm(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {["Term 1", "Term 2", "Term 3"].map((term) => (
        <option key={term} value={term}>
          {term}
        </option>
      ))}
    </select>
  </div>

  {/* Class Selector */}
  <div className="bg-gray-900 p-4 rounded-lg shadow-md">
    <label className="block mb-2 text-sm font-medium text-gray-300">
      Class Level
    </label>
    <select
      value={selectedClass}
      onChange={(e) => setSelectedClass(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {classLevels.map((level) => (
        <option key={level} value={level}>
          {level}
        </option>
      ))}
    </select>
  </div>

  {/* Balance Only */}
  <div className="bg-gray-900 p-4 rounded-lg shadow-md flex items-center justify-between">
    <span className="text-sm font-medium">Only show balances</span>
    <button
      onClick={() => setOnlyWithBalance(!onlyWithBalance)}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
        onlyWithBalance ? "bg-red-500" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          onlyWithBalance ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>

  {/* Search */}
  <div className="bg-gray-900 p-4 rounded-lg shadow-md">
    <label className="block mb-2 text-sm font-medium text-gray-300">
      Search Student
    </label>
    <input
      type="text"
      placeholder="Type a name..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>

{/* Total Outstanding */}
<div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-lg mb-6 shadow-md">
  <h3 className="text-lg font-semibold text-gray-100 mb-2">
    Total Outstanding Fees
  </h3>
  <p className="text-3xl font-bold text-white">
    KSh {totalOutstanding.toLocaleString()}
  </p>
</div>


      {/* Student table */}
      <div className="overflow-y-auto max-h-[290px] rounded-lg border border-gray-800">
        <table className="w-full table-auto">
          <thead className="bg-gray-900 sticky top-0">
            <tr>
              <th className="px-4 py-2 border-b border-gray-800 text-left">
                Student
              </th>
              <th className="px-4 py-2 border-b border-gray-800 text-left">
                Class
              </th>
              <th className="px-4 py-2 border-b border-gray-800 text-left">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => {
              const balance = getStudentBalance(s);
              return (
                <tr key={s._id} className="hover:bg-gray-900 transition">
                  <td className="px-4 py-2 border-b border-gray-800">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800">
                    {s.classLevel}
                  </td>
                  <td
                    className={`px-4 py-2 border-b border-gray-800 font-semibold ${getBalanceColor(
                      balance
                    )}`}
                  >
                    KSh {balance}
                  </td>
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="3" className="px-4 py-4 text-center text-gray-400">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeesPage;
