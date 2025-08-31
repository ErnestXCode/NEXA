// src/pages/fees/Fees.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const Fees = () => {
  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: Infinity, // data stays fresh until manually invalidated
    cacheTime: Infinity,
  });

  if (isLoading) return <p className="p-6 text-white">Loading...</p>;
  if (isError) return <p className="p-6 text-red-500">❌ Error fetching students</p>;

  return (
    <main className="p-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Student Fees</h1>
      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Class</th>
            <th className="p-2 text-left">Fee Balance</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s, i) => (
              <tr
                key={s.admissionNumber}
                className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}
              >
                <td className="p-2">
                  {s.firstName} {s.lastName}
                </td>
                <td className="p-2">{s.classLevel}</td>
                <td className="p-2">{s.feeBalance || "Ksh 0"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-400">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
};

export default Fees;
