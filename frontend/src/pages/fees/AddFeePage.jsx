import React, { useState } from "react";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";

const AddFeePage = () => {
  
  const [filteredStudents, setFilteredStudents] = useState([]);
  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear}/${currentYear + 1}`;
  
  const [form, setForm] = useState({
    studentId: "",
    studentName: "",
    term: "Term 1",
    academicYear: defaultAcademicYear,
    amount: "",
    type: "payment",
    method: "cash",
    note: "",
  });

  const [bulkStudents, setBulkStudents] = useState([
    {
      firstName: "",
      lastName: "",
      classLevel: "",
      openingBalance: 0,
      searchMatches: [],
      studentId: "",
    },
  ]);
  
  const [bulkYear, setBulkYear] = useState(defaultAcademicYear);
  const [bulkTerm, setBulkTerm] = useState("Term 1");
  
  const feeTypes = ["payment", "adjustment"];
  const methods = ["cash", "mpesa", "card"];
  const terms = ["Term 1", "Term 2", "Term 3"];
  
  const queryClient = useQueryClient();

  
  // ✅ Query: all students
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await api.get("/students");
      return res.data;
    },
  });

  // ✅ Query: all proofs
  const { data: proofs = [], isLoading: loadingProofs } = useQuery({
    queryKey: ["proofs", "pending"],
    queryFn: async () => {
      const res = await api.get("/fees/proofs/pending");
      return res.data || [];
    },
  });

  // ✅ Mutation: add fee
  const addFeeMutation = useMutation({
    mutationFn: async (newFee) => {
      const res = await api.post("/fees/transactions", newFee);
      return res.data;
    },
    onSuccess: () => {
      alert("Payment recorded successfully");
      setForm({
        studentId: "",
        studentName: "",
        term: "Term 1",
        academicYear: defaultAcademicYear,
        amount: "",
        type: "payment",
        method: "cash",
        note: "",
      });
      queryClient.refetchQueries(["fees", "balances"]);
      queryClient.refetchQueries(["schoolSummary"]);
      queryClient.refetchQueries(["classSummary"]);
      queryClient.refetchQueries(["schoolTermSummary"]);
      queryClient.refetchQueries(["classTermSummary"]);
      queryClient.refetchQueries(["debtors"]);

    },
    onError: (err) => {
      alert(err.response?.data?.message || "Error submitting payment");
    },
  });

  // ✅ Mutation: bulk onboard students
  const onboardMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/fees/schools/${localStorage.getItem("schoolId")}/onboard-students`,
        {
          academicYear: bulkYear,
          term: bulkTerm,
          students: bulkStudents.map((s) => ({
            studentId: s.studentId,
            openingBalance: s.openingBalance,
            term: s.term || bulkTerm,
          })),
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.refetchQueries(["schoolSummary"]);
      queryClient.refetchQueries(["classSummary"]);
      queryClient.refetchQueries(["schoolTermSummary"]);
      queryClient.refetchQueries(["classTermSummary"]);
      queryClient.refetchQueries(["debtors"]);
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

      queryClient.refetchQueries(["schoolSummary"]);
      queryClient.refetchQueries(["classSummary"]);
      queryClient.refetchQueries(["schoolTermSummary"]);
      queryClient.refetchQueries(["classTermSummary"]);
      queryClient.refetchQueries(["debtors"]);
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
      academicYear: defaultAcademicYear,
    });
    setFilteredStudents([]);
  };
  const [isCSVUpload, setIsCSVUpload] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentId) return alert("Please select a valid student");
    let amountToSend = Number(form.amount);
    if (form.type === "payment") {
      // always positive for payment
      amountToSend = Math.abs(amountToSend);
    }
    addFeeMutation.mutate({
      ...form,
      amount: amountToSend,
      academicYear: form.academicYear,
    });
  };

  const handleProofAction = (id, action) => {
    proofActionMutation.mutate({ id, action });
  };

  const handleBulkChange = (i, field, value) => {
    const updated = [...bulkStudents];
    updated[i][field] = value;
    setBulkStudents(updated);
  };

  const addBulkRow = () => {
    setBulkStudents([
      ...bulkStudents,
      { firstName: "", lastName: "", classLevel: "", openingBalance: 0 },
    ]);
  };

  const submitBulkFees = () => {
    const validRows = bulkStudents.filter((s) => s.studentId);

    if (validRows.length === 0) {
      return alert("No valid students to submit");
    }

    const isCSVUpload = bulkStudents.some((s) => s.error || !s.studentId); // or a better flag if you track CSV separately

    onboardMutation.mutate({
      academicYear: bulkYear,
      term: bulkTerm,
      students: bulkStudents.map((s) => ({
        // if CSV, we don't have studentId guaranteed
        studentId: s.studentId,
        firstName: s.firstName,
        lastName: s.lastName,
        classLevel: s.classLevel,
        openingBalance: s.openingBalance,
        term: s.term || bulkTerm,
        academicYear: s.academicYear || bulkYear,
      })),
      viaCSV: isCSVUpload, // ⚡ add this flag
    });
  };

  const processBulkFile = (rows) => {
    const matchedStudents = rows.map((row) => {
      const student = students.find(
        (s) =>
          s.firstName.toLowerCase() === row.firstName.toLowerCase() &&
          s.lastName.toLowerCase() === row.lastName.toLowerCase() &&
          s.classLevel === row.classLevel
      );

      if (!student) {
        return { ...row, studentId: null, error: "Student not found" };
      }

      return {
        studentId: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        classLevel: student.classLevel,
        openingBalance: Number(row.openingBalance || row.amount || 0),
        term: row.term || "Term 1",
        academicYear: row.academicYear || defaultAcademicYear,
      };
    });

    setBulkStudents(matchedStudents);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCSVUpload(true); //

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // jsonData = [{ firstName, lastName, classLevel, amount, term?, academicYear? }, ...]
    processBulkFile(jsonData);
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

            {/* Term */}
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

            {/* Academic Year */}
            <input
              type="text"
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              placeholder="Academic Year"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Type */}
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {feeTypes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            {/* Amount */}
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder={
                form.type === "adjustment"
                  ? "Enter positive or negative amount"
                  : "Amount"
              }
              required
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Method */}
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

            {/* Note */}
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

        {/* --- Fee assignment --- */}
        {/* --- Fee assignment --- */}
        <div className="p-6 bg-gray-900 rounded-md shadow-md flex flex-col space-y-6">
          <h2 className="text-2xl font-bold text-center border-b border-gray-800 pb-2">
            Fee Assignment
          </h2>

          {/* Year & Term */}
          <div className="flex gap-4">
            <input
              type="text"
              value={bulkYear}
              onChange={(e) => setBulkYear(e.target.value)}
              placeholder="Academic Year"
              className="border p-2 rounded-lg w-1/2 bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={bulkTerm}
              onChange={(e) => setBulkTerm(e.target.value)}
              className="border p-2 rounded-lg w-1/2 bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Students List */}
          <div className="space-y-4">
            {bulkStudents.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-3 items-center bg-gray-800 p-4 rounded-lg shadow relative"
              >
                {/* Student Typeahead */}
                <div className="col-span-5 relative">
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={`${s.firstName} ${s.lastName}`.trim()}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const matches = students.filter((st) =>
                        `${st.firstName} ${st.lastName}`
                          .toLowerCase()
                          .includes(val)
                      );
                      handleBulkChange(i, "searchMatches", matches);
                      handleBulkChange(
                        i,
                        "firstName",
                        e.target.value.split(" ")[0] || ""
                      );
                      handleBulkChange(
                        i,
                        "lastName",
                        e.target.value.split(" ")[1] || ""
                      );
                      handleBulkChange(i, "studentId", "");
                      handleBulkChange(i, "classLevel", "");
                    }}
                    className="border p-2 rounded-lg w-full bg-gray-900 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {s.searchMatches?.length > 0 && (
                    <ul className="absolute bg-gray-900 border border-gray-700 mt-1 max-h-40 overflow-auto rounded shadow-lg z-20 w-full">
                      {s.searchMatches.map((st) => (
                        <li
                          key={st._id}
                          onClick={() => {
                            handleBulkChange(i, "firstName", st.firstName);
                            handleBulkChange(i, "lastName", st.lastName);
                            handleBulkChange(i, "studentId", st._id);
                            handleBulkChange(i, "classLevel", st.classLevel);
                            handleBulkChange(i, "searchMatches", []);
                          }}
                          className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                        >
                          {st.firstName} {st.lastName}{" "}
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            {st.classLevel}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Class Badge */}
                <div className="col-span-3 flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      s.classLevel
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {s.classLevel || "No class"}
                  </span>
                </div>

                {/* Opening Balance */}
                <div className="col-span-4">
                  <input
                    type="number"
                    placeholder="Opening Balance"
                    value={s.openingBalance}
                    onChange={(e) =>
                      handleBulkChange(
                        i,
                        "openingBalance",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="border p-2 rounded-lg w-full bg-gray-900 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={addBulkRow}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              + Add Row
            </button>
            <button
              onClick={() => onboardMutation.mutate()}
              disabled={onboardMutation.isPending}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              {onboardMutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>

          {onboardMutation.isSuccess && (
            <p className="mt-2 text-green-400 text-sm">
              ✅ {onboardMutation.data.count} students onboarded successfully!
            </p>
          )}
          {onboardMutation.isError && (
            <p className="mt-2 text-red-400 text-sm">
              ❌ Error: {onboardMutation.error.message}
            </p>
          )}

          {/* CSV Upload Section */}
          <section className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">
              📂 Bulk Upload via Excel / CSV
            </h3>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
              className="bg-gray-900 border border-gray-700 p-2 rounded w-full"
            />
            <button
              onClick={() =>
                onboardMutation.mutate({
                  academicYear: bulkYear,
                  term: bulkTerm,
                  students: bulkStudents.map((s) => ({
                    studentId: s.studentId,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    classLevel: s.classLevel,
                    openingBalance: s.openingBalance,
                    term: s.term || bulkTerm,
                    academicYear: s.academicYear || bulkYear,
                  })),
                  viaCSV: isCSVUpload,
                })
              }
              disabled={onboardMutation.isPending}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              {onboardMutation.isPending ? "Submitting..." : "Submit CSV"}
            </button>
          </section>
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
                          onClick={() => handleProofAction(p._id, "approve")}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleProofAction(p._id, "reject")}
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
