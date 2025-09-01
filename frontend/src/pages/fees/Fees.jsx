// src/pages/fees/Fees.jsx
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const fetchFees = async () => {
  const res = await api.get("/fees");
  return res.data;
};

const Fees = ({ onSelectStudent, onNavigate }) => {
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [filterClass, setFilterClass] = useState("");
  const [onlyWithBalance, setOnlyWithBalance] = useState(false);
  const [searchName, setSearchName] = useState("");

  const {
    data: students = [],
    isLoading: studentsLoading,
  } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: Infinity,
  });

  const {
    data: fees = [],
    isLoading: feesLoading,
  } = useQuery({
    queryKey: ["fees"],
    queryFn: fetchFees,
    staleTime: Infinity,
  });

  if (studentsLoading || feesLoading)
    return <p className="p-6 text-white">Loading...</p>;

  const getTermPaid = (studentId) => {
    const studentFees = fees.filter(
      (f) => f.student === studentId && f.term === selectedTerm
    );
    return studentFees.reduce((sum, f) => sum + f.amount, 0);
  };

  // Totals for progress bar
  const totalExpected = students.reduce(
    (sum, s) =>
      sum +
      (s.feeExpectations?.find((f) => f.term === selectedTerm)?.amount || 0),
    0
  );
  const totalPaid = students.reduce((sum, s) => sum + getTermPaid(s._id), 0);
  const totalOutstanding = totalExpected - totalPaid;
  const percentageCollected = totalExpected
    ? (totalPaid / totalExpected) * 100
    : 0;

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const expected =
        s.feeExpectations?.find((f) => f.term === selectedTerm)?.amount || 0;
      const paid = getTermPaid(s._id);
      const balance = expected - paid;

      const matchesClass = filterClass ? s.classLevel === filterClass : true;
      const matchesBalance = onlyWithBalance ? balance > 0 : true;
      const matchesName = searchName
        ? `${s.firstName} ${s.lastName}`
            .toLowerCase()
            .includes(searchName.toLowerCase())
        : true;

      return matchesClass && matchesBalance && matchesName;
    });
  }, [students, fees, selectedTerm, filterClass, onlyWithBalance, searchName]);

  return (
    <main className="p-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Student Fees</h1>

      {/* Term selector + actions */}
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="p-2 rounded bg-gray-900 text-white"
        >
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>

        <button
          onClick={() => onNavigate("payment")}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          Record Payment
        </button>
        <button
          onClick={() => onNavigate("setup")}
          className="bg-gray-700 hover:bg-gray-600 p-2 rounded font-semibold"
        >
          Setup Term Fees
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="p-2 rounded bg-gray-900 text-white"
        >
          <option value="">All Classes</option>
          {[...new Set(students.map((s) => s.classLevel))].map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyWithBalance}
            onChange={(e) => setOnlyWithBalance(e.target.checked)}
          />
          Show Only With Balance
        </label>

        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="p-2 rounded bg-gray-900 text-white"
        />
      </div>

      {/* Summary cards */}
      <div className="mb-4 flex gap-4 flex-wrap">
        <div className="bg-gray-800 p-4 rounded">Expected: KSh {totalExpected}</div>
        <div className="bg-gray-800 p-4 rounded">Collected: KSh {totalPaid}</div>
        <div className="bg-gray-800 p-4 rounded">
          Outstanding: KSh {totalOutstanding}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 h-4 rounded mb-6">
        <div
          className="bg-blue-600 h-4 rounded"
          style={{ width: `${percentageCollected}%` }}
        />
      </div>

      {/* Table */}
      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Class</th>
            <th className="p-2 text-left">Expected</th>
            <th className="p-2 text-left">Paid</th>
            <th className="p-2 text-left">Balance</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s, i) => {
            const expected =
              s.feeExpectations?.find((f) => f.term === selectedTerm)?.amount ||
              0;
            const paid = getTermPaid(s._id);
            const balance = expected - paid;

            return (
              <tr
                key={s._id}
                className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}
              >
                <td className="p-2">
                  {s.firstName} {s.lastName}
                </td>
                <td className="p-2">{s.classLevel}</td>
                <td className="p-2">{expected}</td>
                <td className="p-2">{paid}</td>
                <td className="p-2">{balance}</td>
                <td className="p-2">
                  <button
                    onClick={() => onSelectStudent(s._id)}
                    className="bg-green-600 hover:bg-green-700 p-1 rounded"
                  >
                    Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
};

export default Fees;
