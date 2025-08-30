// src/pages/fees/FeePaymentForm.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const FeePaymentForm = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students");
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/fees", { studentId: selectedStudent, amount });
      setMessage("✅ Fee payment recorded successfully!");
      setSelectedStudent(""); setAmount("");
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to record payment"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Record Fee Payment</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96">
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="p-2 rounded bg-gray-900 text-white"
        >
          <option value="" disabled>Select student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.firstName} {s.lastName} ({s.admissionNumber})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount"
          className="p-2 rounded bg-gray-900 text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold">
          Record Payment
        </button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default FeePaymentForm;
