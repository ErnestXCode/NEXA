import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const FeesPage = () => {
  const [students, setStudents] = useState([]);
  const [school, setSchool] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedClass, setSelectedClass] = useState("All");
  const [onlyWithBalance, setOnlyWithBalance] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchSchool();
  }, []);

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

  const getStudentBalance = (student) => {
    if (!school) return 0;

    const termExpectation = school.feeExpectations.find(f => f.term === selectedTerm);
    const expected = termExpectation?.amount || 0;

    const payments = student.payments
      .filter(p => p.term === selectedTerm && p.category === "payment")
      .reduce((sum, p) => sum + p.amount, 0);

    const adjustments = student.payments
      .filter(p => p.term === selectedTerm && p.category === "adjustment")
      .reduce((sum, p) => sum + p.amount, 0);

    return expected - payments + adjustments;
  };

  const getBalanceColor = (balance) => {
    if (balance === 0) return "text-green-400";       // fully paid
    if (balance > 0) return "text-red-400";          // owes money
    return "text-yellow-400";                        // overpaid
  };

  // Get unique class levels for filter
  const classLevels = ["All", ...new Set(students.map(s => s.classLevel))];

  // Apply filters
  const filteredStudents = students.filter(s => {
    const balance = getStudentBalance(s);
    const classMatch = selectedClass === "All" || s.classLevel === selectedClass;
    const balanceMatch = !onlyWithBalance || balance > 0;
    return classMatch && balanceMatch;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-950 text-gray-100 rounded-md shadow-lg mt-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Student Fees - {selectedTerm}</h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="mr-2 font-medium">Select Term:</label>
          <select
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {["Term 1", "Term 2", "Term 3"].map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium">Class Level:</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="onlyWithBalance"
            checked={onlyWithBalance}
            onChange={() => setOnlyWithBalance(!onlyWithBalance)}
            className="mr-2 accent-blue-500"
          />
          <label htmlFor="onlyWithBalance" className="font-medium">Only show students with balance</label>
        </div>
      </div>

      {/* Student table */}
      <table className="w-full table-auto border border-gray-700 rounded-md">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-4 py-2 border-b border-gray-700">Student</th>
            <th className="px-4 py-2 border-b border-gray-700">Class</th>
            <th className="px-4 py-2 border-b border-gray-700">Balance</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(s => {
            const balance = getStudentBalance(s);
            return (
              <tr key={s._id} className="hover:bg-gray-900 transition">
                <td className="px-4 py-2 border-b border-gray-700">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-2 border-b border-gray-700">{s.classLevel}</td>
                <td className={`px-4 py-2 border-b border-gray-700 font-semibold ${getBalanceColor(balance)}`}>
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
  );
};

export default FeesPage;
