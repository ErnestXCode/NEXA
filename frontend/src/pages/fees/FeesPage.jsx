import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const FeesPage = () => {
  const [students, setStudents] = useState([]);
  const [school, setSchool] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedClass, setSelectedClass] = useState("All");
  const [onlyWithBalance, setOnlyWithBalance] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 search input
  const [totalOutstanding, setTotalOutstanding] = useState("...");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null); // fee object being edited
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("payment");
  const [editMethod, setEditMethod] = useState("cash");
  const [editNote, setEditNote] = useState("");

  const openEditModal = (student, balance) => {
    // Find the student's fee entry for the selected term
    const fee = student.payments.find(
      (p) => p.term === selectedTerm && p.category === "payment"
    );

    setEditingFee({ studentId: student._id, feeId: fee?._id });
    setEditAmount(fee?.amount || balance);
    setEditType(fee?.category || "payment");
    setEditMethod(fee?.type || "cash");
    setEditNote(fee?.note || "");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    fetchStudents();
    fetchSchool();
  }, []);

  useEffect(() => {
    fetchOutstanding();
  }, [selectedTerm, selectedClass]);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchSchool = async () => {
    try {
      const res = await api.get("/schools/me");
      setSchool(res.data);
    } catch (err) {
      console.error("Error fetching school:", err);
    }
  };

  const fetchOutstanding = async () => {
    try {
      let query = `?term=${selectedTerm}`;
      if (selectedClass !== "All") query += `&classLevel=${selectedClass}`;
      const res = await api.get(`/fees/total-outstanding${query}`);
      setTotalOutstanding(res.data.totalOutstanding || 0);
    } catch (err) {
      console.error("Error fetching outstanding fees:", err);
    }
  };

  const getStudentBalance = (student) => {
    if (!school) return 0;

    let expectations = [];

    if (Array.isArray(school.feeRules) && school.feeRules.length) {
      const idx = school.classLevels.findIndex(
        (c) => c.name === student.classLevel
      );

      const matchedRules = school.feeRules.filter((rule) => {
        const fromIdx = school.classLevels.findIndex(
          (c) => c.name === rule.fromClass
        );
        const toIdx = school.classLevels.findIndex(
          (c) => c.name === rule.toClass
        );
        if (idx === -1 || fromIdx === -1 || toIdx === -1) return false;
        const min = Math.min(fromIdx, toIdx);
        const max = Math.max(fromIdx, toIdx);
        return idx >= min && idx <= max && rule.term === selectedTerm;
      });

      if (matchedRules.length) expectations = matchedRules;
    }

    if (!expectations.length) {
      const classDef = (school.classLevels || []).find(
        (c) => c.name === student.classLevel
      );
      if (classDef && Array.isArray(classDef.feeExpectations)) {
        expectations = classDef.feeExpectations.filter(
          (f) => f.term === selectedTerm
        );
      }
    }

    if (!expectations.length) {
      expectations = (school.feeExpectations || []).filter(
        (f) => f.term === selectedTerm
      );
    }

    const expected = expectations[0]?.amount || 0;

    const payments = student.payments
      .filter((p) => p.term === selectedTerm && p.category === "payment")
      .reduce((sum, p) => sum + p.amount, 0);

    const adjustments = student.payments
      .filter((p) => p.term === selectedTerm && p.category === "adjustment")
      .reduce((sum, p) => sum + p.amount, 0);

    return expected - payments + adjustments;
  };

  const getBalanceColor = (balance) => {
    if (balance === 0) return "text-green-400"; // fully paid
    if (balance > 0) return "text-red-400"; // owes money
    return "text-yellow-400"; // overpaid
  };

  const classLevels = ["All", ...new Set(students.map((s) => s.classLevel))];

  const filteredStudents = students.filter((s) => {
    const balance = getStudentBalance(s);
    const classMatch =
      selectedClass === "All" || s.classLevel === selectedClass;
    const balanceMatch = !onlyWithBalance || balance > 0;
    const nameMatch = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()); // 🔹 name filter
    return classMatch && balanceMatch && nameMatch;
  });

  const submitEdit = async () => {
    if (!editingFee) return;

    try {
      const res = await api.patch(`/fees/${editingFee.feeId}`, {
        amount: editAmount,
        type: editType,
        method: editMethod,
        note: editNote,
      });

      // Update local students state
      setStudents((prev) =>
        prev.map((s) => {
          if (s._id === editingFee.studentId) {
            const updatedPayments = s.payments.map((p) =>
              p._id === editingFee.feeId
                ? {
                    ...p,
                    amount: editAmount,
                    category: editType,
                    type: editMethod,
                    note: editNote,
                  }
                : p
            );
            return { ...s, payments: updatedPayments };
          }
          return s;
        })
      );

      closeModal();
      fetchOutstanding(); // recalc total outstanding
    } catch (err) {
      console.error("Error updating fee:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-950 text-gray-100 rounded-lg shadow-lg mt-6 overflow-hidden">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">
        Student Fees - {selectedTerm}
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Term Selector */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-md">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Select Term
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {["Term 1", "Term 2", "Term 3"].map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        {/* Class Selector */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-md">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Class Level
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Balance Only */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-md flex items-center justify-between">
          <span className="text-sm font-medium">Only show balances</span>
          <button
            onClick={() => setOnlyWithBalance(!onlyWithBalance)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
              onlyWithBalance ? "bg-red-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                onlyWithBalance ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Search */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-md">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Search Student
          </label>
          <input
            type="text"
            placeholder="Type a name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Total Outstanding */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-lg mb-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Total Outstanding Fees
        </h3>
        <p className="text-3xl font-bold text-white">
          KSh {totalOutstanding.toLocaleString()}
        </p>
      </div>

      {/* Student table */}
      <div className="overflow-y-auto max-h-[290px] rounded-lg border border-gray-800">
        <table className="w-full table-auto">
          <thead className="bg-gray-900 sticky top-0">
            <tr>
              <th className="px-4 py-2 border-b border-gray-800 text-left">
                Student
              </th>
              <th className="px-4 py-2 border-b border-gray-800 text-left">
                Class
              </th>
              <th className="px-4 py-2 border-b border-gray-800 text-left">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => {
              const balance = getStudentBalance(s);
              return (
                <tr key={s._id} className="hover:bg-gray-900 transition">
                  <td className="px-4 py-2 border-b border-gray-800">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800">
                    {s.classLevel}
                  </td>
                  <td
                    className={`px-4 py-2 border-b border-gray-800 font-semibold ${getBalanceColor(
                      balance
                    )}`}
                  >
                    KSh {balance}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800">
                    <button
                      onClick={() => openEditModal(s, getStudentBalance(s))}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="3" className="px-4 py-4 text-center text-gray-400">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-100">Edit Fee</h3>

            <label className="block mb-2 text-sm text-gray-300">Amount</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4 text-gray-100"
            />

            <label className="block mb-2 text-sm text-gray-300">Type</label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4"
            >
              <option value="payment">Payment</option>
              <option value="adjustment">Adjustment</option>
            </select>

            <label className="block mb-2 text-sm text-gray-300">Method</label>
            <select
              value={editMethod}
              onChange={(e) => setEditMethod(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4"
            >
              <option value="cash">Cash</option>
              <option value="mpesa">Mpesa</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </select>

            <label className="block mb-2 text-sm text-gray-300">Note</label>
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4 text-gray-100"
            />

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                onClick={submitEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;
