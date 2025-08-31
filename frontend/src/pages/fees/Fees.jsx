// src/pages/fees/Fees.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const fetchFees = async () => {
  const res = await api.get("/fees"); // all fee records
  return res.data;
};

const Fees = ({ onSelectStudent, onNavigate }) => {
  const [selectedTerm, setSelectedTerm] = useState("Term 1");

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
    refetch: refetchFees,
  } = useQuery({
    queryKey: ["fees"],
    queryFn: fetchFees,
    staleTime: Infinity,
  });

  if (studentsLoading || feesLoading) return <p className="p-6 text-white">Loading...</p>;

  // Calculate total paid for a student in selected term
  const getTermPaid = (studentId) => {
    const studentFees = fees.filter(f => f.student === studentId && f.term === selectedTerm);
    return studentFees.reduce((sum, f) => sum + f.amount, 0);
  };

  const totalExpected = students.reduce(
    (sum, s) => sum + (s.feeExpectations?.find(f => f.term === selectedTerm)?.amount || 0),
    0
  );

  const totalPaid = students.reduce((sum, s) => sum + getTermPaid(s._id), 0);
  const totalOutstanding = totalExpected - totalPaid;
  const percentageCollected = totalExpected ? (totalPaid / totalExpected) * 100 : 0;

  return (
    <main className="p-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Student Fees</h1>

      <div className="mb-4 flex gap-4 items-center">
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

      <div className="mb-4 flex gap-4">
        <div className="bg-gray-800 p-4 rounded">Expected: KSh {totalExpected}</div>
        <div className="bg-gray-800 p-4 rounded">Collected: KSh {totalPaid}</div>
        <div className="bg-gray-800 p-4 rounded">Outstanding: KSh {totalOutstanding}</div>
      </div>

      <div className="w-full bg-gray-800 h-4 rounded mb-6">
        <div className="bg-blue-600 h-4 rounded" style={{ width: `${percentageCollected}%` }} />
      </div>

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
          {students.map((s, i) => {
            const expected = s.feeExpectations?.find(f => f.term === selectedTerm)?.amount || 0;
            const paid = getTermPaid(s._id);
            const balance = expected - paid;

            return (
              <tr key={s._id} className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}>
                <td className="p-2">{s.firstName} {s.lastName}</td>
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
