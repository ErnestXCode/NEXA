import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import * as XLSX from "xlsx";

const AddFeePage = () => {
  const [students, setStudents] = useState([]);
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

  const [bulkData, setBulkData] = useState([]);
  const [bulkType, setBulkType] = useState("existing"); // "existing" or "new"

  const feeTypes = ["payment", "adjustment"];
  const methods = ["cash", "mpesa", "card"];
  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId) return alert("Please select a valid student");
    try {
      const res = await api.post("/fees", form);
      alert(res.data.msg || "Payment recorded successfully");
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
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting payment");
    }
  };

  const handleBulkFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setBulkData(json);
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (!bulkData.length) return alert("No data to upload");
    try {
      if (bulkType === "existing") {
        const res = await api.post("/fees/bulk-upload", bulkData);
        alert(res.data.message || "Bulk upload completed");
      } else {
        const res = await api.post("/fees/bulk-upload-with-fees", bulkData);
        alert(res.data.message || "Bulk upload completed");
        api.get("/students").then((res) => setStudents(res.data));
      }
      setBulkData([]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error uploading bulk data");
    }
  };

  const renderBulkInstructions = () => {
    if (bulkType === "existing") {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded text-sm text-gray-300 mb-4">
          <strong>Instructions for Existing Students Fees:</strong>
          <ul className="list-disc list-inside mt-1">
            <li>Include <code>studentId</code> (MongoDB ID of existing student).</li>
            <li>Include <code>term</code> (e.g., Term 1, Term 2, Term 3).</li>
            <li>Include <code>academicYear</code> (e.g., 2025).</li>
            <li>Include <code>amount</code> (numeric).</li>
            <li>Optional: <code>type</code> (payment or adjustment), <code>method</code> (cash, mpesa, card), <code>note</code>.</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded text-sm text-gray-300 mb-4">
          <strong>Instructions for New Students with Fees:</strong>
          <ul className="list-disc list-inside mt-1">
            <li>Include <code>firstName</code>, <code>lastName</code>, <code>middleName</code>.</li>
            <li>Include <code>gender</code> (male/female).</li>
            <li>Include <code>dateOfBirth</code> (YYYY-MM-DD format).</li>
            <li>Include <code>classLevel</code> and <code>stream</code>.</li>
            <li>Include fee details: <code>term</code>, <code>academicYear</code>, <code>amount</code>.</li>
            <li>Optional: <code>method</code> (cash, mpesa, card), <code>note</code>.</li>
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="overflow-y-hidden p-6 bg-gray-950 text-gray-100 flex justify-center items-start">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* --- Single Student Payment Form --- */}
        <div className="p-6 bg-gray-900 rounded-md shadow-md flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Add Payment / Adjustment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-1">
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

        {/* --- Bulk Upload Section --- */}
        <div className="p-6 bg-gray-900 rounded-md shadow-md flex flex-col justify-between">
          <h2 className="text-2xl font-bold text-center mb-4">Bulk Upload</h2>

          {/* Radio buttons with nicer styles */}
          <div className="flex justify-center mb-4 space-x-4">
            <label className={`cursor-pointer px-4 py-2 rounded-md border ${bulkType === "existing" ? "bg-blue-600 border-blue-600" : "bg-gray-800 border-gray-700"} hover:bg-blue-500`}>
              <input
                type="radio"
                name="bulkType"
                value="existing"
                checked={bulkType === "existing"}
                onChange={(e) => setBulkType(e.target.value)}
                className="hidden"
              />
              Existing Students Fees
            </label>
            <label className={`cursor-pointer px-4 py-2 rounded-md border ${bulkType === "new" ? "bg-blue-600 border-blue-600" : "bg-gray-800 border-gray-700"} hover:bg-blue-500`}>
              <input
                type="radio"
                name="bulkType"
                value="new"
                checked={bulkType === "new"}
                onChange={(e) => setBulkType(e.target.value)}
                className="hidden"
              />
              New Students with Fees
            </label>
          </div>

          {/* Dynamic Instructions */}
          {renderBulkInstructions()}

          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleBulkFile}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />

          {bulkData.length > 0 && (
            <div className="text-sm text-gray-300 mb-2">
              {bulkData.length} records ready to upload
            </div>
          )}

          <button
            onClick={handleBulkUpload}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition mt-auto"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFeePage;
