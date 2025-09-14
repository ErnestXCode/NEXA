import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import AddFeeBulkPage from "./AddFeeBulkPage";

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

  
  

  return (
    <div className="overflow-y-hidden p-6 bg-gray-950 text-gray-100 flex justify-center ">
      
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

      <AddFeeBulkPage />
    </div>
  );
};

export default AddFeePage;
