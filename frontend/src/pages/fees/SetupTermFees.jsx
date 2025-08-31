import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../api/axios";

const SetupTermFees = ({ onBack }) => {
  const [term, setTerm] = useState("Term 1");
  const [classFees, setClassFees] = useState([{ classLevel: "", amount: "" }]);
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => api.post("/students/setup-term-fees", data), // new backend route
    onSuccess: () => {
      setMessage("✅ Term fees setup successfully!");
      setClassFees([{ classLevel: "", amount: "" }]);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Failed to setup term"}`);
    },
  });

  const handleAddClass = () => setClassFees([...classFees, { classLevel: "", amount: "" }]);
  const handleClassChange = (index, field, value) => {
    const updated = [...classFees];
    updated[index][field] = value;
    setClassFees(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      term,
      classFees,
    });
  };

  return (
    <main className="p-6 bg-gray-950 text-white min-h-screen flex justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4">Setup Term Fees</h1>

        <button onClick={onBack} type="button" className="mb-4 bg-gray-700 hover:bg-gray-600 p-2 rounded">
          ← Back
        </button>

        <select value={term} onChange={(e) => setTerm(e.target.value)} className="p-2 rounded bg-gray-800 text-white">
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>

        {classFees.map((cf, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Class Level"
              value={cf.classLevel}
              onChange={(e) => handleClassChange(i, "classLevel", e.target.value)}
              className="p-2 rounded bg-gray-800 text-white flex-1"
            />
            <input
              type="number"
              placeholder="Amount"
              value={cf.amount}
              onChange={(e) => handleClassChange(i, "amount", e.target.value)}
              className="p-2 rounded bg-gray-800 text-white w-32"
            />
          </div>
        ))}

        <button type="button" onClick={handleAddClass} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">
          + Add Another Class
        </button>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold">
          Save Term
        </button>

        {message && <p className={`mt-2 ${message.startsWith("✅") ? "text-green-400" : "text-red-500"}`}>{message}</p>}
      </form>
    </main>
  );
};

export default SetupTermFees;
