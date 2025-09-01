// src/pages/fees/FeePaymentForm.jsx
import React, { useState, useMemo } from "react";
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
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const mutation = useMutation({
    mutationFn: (payment) => api.post("/fees", payment),
    onSuccess: () => {
      setMessage("✅ Fee payment recorded successfully!");
      setSelectedStudent("");
      setStudentId("");
      setAmount("");
      queryClient.refetchQueries(["students"]);
      queryClient.refetchQueries(["feesOutstanding"]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to record payment"}`);
    },
  });

  const handleStudentChange = (value) => {
    setSelectedStudent(value);
    if (!value) {
      setSuggestions([]);
      setStudentId("");
      return;
    }

    const filtered = students.filter((s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSelectStudent = (s) => {
    setSelectedStudent(`${s.firstName} ${s.lastName} (${s.classLevel})`);
    setStudentId(s._id);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId || !amount) {
      setMessage("❌ Please select a student and enter an amount");
      return;
    }

    mutation.mutate({
      studentId,
      term,
      amount: Number(amount),
      type: "payment",
      method: paymentMethod,
      note: "",
    });
  };

  if (isLoading) return <p className="p-6 text-white">Loading students...</p>;

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-md flex flex-col gap-4 relative"
      >
        <h1 className="text-2xl font-bold mb-4">Record Fee Payment</h1>

        <button
          type="button"
          onClick={onBack}
          className="mb-4 bg-gray-700 hover:bg-gray-600 p-2 rounded"
        >
          ← Back
        </button>

        {/* Autocomplete student input */}
        <div className="relative">
          <input
            type="text"
            value={selectedStudent}
            onChange={(e) => handleStudentChange(e.target.value)}
            placeholder="Type student name..."
            className="p-2 rounded bg-gray-800 text-white w-full"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded mt-1 max-h-40 overflow-auto">
              {suggestions.map((s) => (
                <li
                  key={s._id}
                  onClick={() => handleSelectStudent(s)}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                >
                  {s.firstName} {s.lastName} ({s.classLevel})
                </li>
              ))}
            </ul>
          )}
        </div>

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
