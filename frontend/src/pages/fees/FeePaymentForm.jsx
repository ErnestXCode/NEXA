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
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // new
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
    if (!selectedStudent || !amount) {
      setMessage("❌ Please select a student and enter an amount");
      return;
    }

    mutation.mutate({
      studentId: selectedStudent,
      term,
      amount: Number(amount),
      type: "payment", // backend expects 'payment' or 'adjustment'
      method: paymentMethod, // optional: cash/mpesa/card
      note: "",
    });
  };

  if (isLoading) return <p className="p-6 text-white">Loading students...</p>;

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-4">Record Fee Payment</h1>

        <button
          type="button"
          onClick={onBack}
          className="mb-4 bg-gray-700 hover:bg-gray-600 p-2 rounded"
        >
          ← Back
        </button>

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="" disabled>
            Select student
          </option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.firstName} {s.lastName} ({s.classLevel})
            </option>
          ))}
        </select>

        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="cash">Cash</option>
          <option value="mpesa">MPESA</option>
          <option value="card">Card</option>
        </select>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {mutation.isLoading ? "Recording..." : "Record Payment"}
        </button>

        {message && (
          <p
            className={`mt-2 ${
              message.startsWith("✅") ? "text-green-400" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  );
};

export default FeePaymentForm;
