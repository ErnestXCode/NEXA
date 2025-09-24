import React, { useState } from "react";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import AddFeeBulkPage from "./AddFeeBulkPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AddFeePage = () => {
  const queryClient = useQueryClient();

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    studentName: "",
    term: "Term 1",
    academicYear: new Date().getFullYear(),
    amount: "",
    type: "payment",
    method: "cash",
    note: "",
  });

  const feeTypes = ["payment", "adjustment"];
  const methods = ["cash", "mpesa", "card"];
  const terms = ["Term 1", "Term 2", "Term 3"];

  // ✅ Query: all students
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await api.get("/students");
      return res.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  // ✅ Query: all proofs
  const {
    data: proofs = [],
    isLoading: loadingProofs,
  } = useQuery({
    queryKey: ["proofs", "pending"],
    queryFn: async () => {
      const res = await api.get("/fees/proofs/pending");
      return res.data || [];
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  // ✅ Mutation: add fee
  const addFeeMutation = useMutation({
    mutationFn: async (newFee) => {
      const res = await api.post("/fees", newFee);
      return res.data;
    },
    onSuccess: () => {
      alert("Payment recorded successfully");
      setForm({
        studentId: "",
        studentName: "",
        term: "Term 1",
        academicYear: new Date().getFullYear(),
        amount: "",
        type: "payment",
        method: "cash",
        note: "",
      });
      queryClient.refetchQueries(["fees", "balances"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Error submitting payment");
    },
  });

  // ✅ Mutation: approve/reject proof
  const proofActionMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      await api.patch(`/fees/proofs/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.refetchQueries(["proofs", "pending"]);
      queryClient.refetchQueries(["myProofs"]);
    },
  });

  // Handle manual form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "studentName") {
      const filtered = students.filter((s) =>
        `${s.firstName} ${s.lastName}`
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const selectStudent = (student) => {
    setForm({
      ...form,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      academicYear: new Date().getFullYear(),
    });
    setFilteredStudents([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentId) return alert("Please select a valid student");
    addFeeMutation.mutate(form);
  };

  const handleProofAction = (id, action) => {
    proofActionMutation.mutate({ id, action });
  };

  return (
    <div className="overflow-y-auto p-6 bg-gray-950 text-gray-100 min-h-screen space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* --- Single Student Payment Form --- */}
        <div className="p-6 bg-gray-900 rounded-md shadow-md flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Add Payment / Adjustment
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col flex-1"
          >
            {/* Student Typeahead */}
            <div className="relative">
              <input
                type="text"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                placeholder="Type student name..."
                autoComplete="off"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {filteredStudents.length > 0 && (
                <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 mt-1 max-h-40 overflow-auto rounded shadow-lg">
                  {filteredStudents.map((s) => (
                    <li
                      key={s._id}
                      onClick={() => selectStudent(s)}
                      className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                    >
                      {s.firstName} {s.lastName} ({s.classLevel})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              name="term"
              value={form.term}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              placeholder="Academic Year"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ MozAppearance: "textfield" }}
            />

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Amount"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ MozAppearance: "textfield" }}
            />

            <input
              list="feeTypes"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="feeTypes">
              {feeTypes.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>

            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {methods.map((m) => (
                <option key={m} value={m}>
                  {m.toUpperCase()}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Note"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition mt-auto"
            >
              Submit
            </button>
          </form>
        </div>

        {/* --- Bulk Onboarding Upload --- */}
        <div className="p-6 bg-gray-900 rounded-md shadow-md flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Bulk Import Balances (Onboarding)
          </h2>
          <AddFeeBulkPage />
        </div>
      </div>

      {/* --- Proofs Management --- */}
      <div className="p-6 bg-gray-900 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-6">Payment Proofs</h2>
        {loadingProofs ? (
          <p>Loading proofs...</p>
        ) : proofs.length === 0 ? (
          <p>No proofs submitted yet.</p>
        ) : (
          <table className="w-full border border-gray-800 rounded text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2">Parent</th>
                <th className="p-2">Student</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Txn Code</th>
                <th className="p-2">Method</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proofs.map((p) => (
                <tr key={p._id} className="border-t border-gray-800">
                  <td className="p-2">{p.parentId?.name || "N/A"}</td>
                  <td className="p-2">
                    {p.studentId?.firstName} {p.studentId?.lastName}
                  </td>
                  <td className="p-2">KSh {p.amount}</td>
                  <td className="p-2">{p.txnCode}</td>
                  <td className="p-2">{p.method}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2 flex gap-2">
                    {p.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleProofAction(p._id, "approve")
                          }
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleProofAction(p._id, "reject")
                          }
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddFeePage;
