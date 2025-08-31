// src/pages/fees/FeePaymentForm.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const fetchStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

const FeePaymentForm = ({ onBack }) => {
  const queryClient = useQueryClient();
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (payment) => api.post("/fees", payment),
    onSuccess: () => {
      setMessage("✅ Fee payment recorded successfully!");
      setSelectedStudent("");
      setAmount("");
      queryClient.refetchQueries(["students"]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to record payment"}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      studentId: selectedStudent,
      amount: Number(amount),
      term,
      generateReceipt: true,
    });
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Record Fee Payment</h1>
      <button
        onClick={onBack}
        className="mb-4 bg-gray-700 hover:bg-gray-600 p-2 rounded"
      >
        ← Back
      </button>
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

        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="p-2 rounded bg-gray-900 text-white"
        >
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          className="p-2 rounded bg-gray-900 text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {mutation.isLoading ? "Recording..." : "Record Payment"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
};

export default FeePaymentForm;
