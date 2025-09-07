// src/pages/personnel/ParentForm.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const initialParent = {
  name: "",
  email: "",
  password: "",
  confirmPass: "",
  phoneNumber: "",
  children: [],
};

const ParentForm = ({ onNext }) => {
  const [parentDetails, setParentDetails] = useState(initialParent);
  const [canRegister, setCanRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [file, setFile] = useState(null);

  const queryClient = useQueryClient();

  // Fetch all students
  const { data: students = [] } = useQuery({
    queryKey: ["studentsForParent"],
    queryFn: () => api.get("/students").then((res) => res.data),
  });

  // Filter students based on search
  useEffect(() => {
    if (!studentSearch) return setFilteredStudents([]);
    const filtered = students.filter((s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(studentSearch.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [studentSearch, students]);

  // Mutation
  const addParentMutation = useMutation({
    mutationFn: async (data) => {
      if (data.bulk) {
        return api.post("/auth/registerparent/bulk", { parents: data.bulk });
      } else {
        return api.post("/auth/registerpersonel", {
          ...data.single,
          role: "parent",
        });
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["parents"], exact: true });
      if (onNext) onNext();
    },
  });

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...parentDetails, [name]: value };
    setParentDetails(updated);

    setCanRegister(
      updated.name.trim() &&
        updated.email.trim() &&
        updated.phoneNumber.trim() &&
        updated.password &&
        updated.confirmPass === updated.password
    );
  };

  // Children selection
  const addChild = (student) => {
    if (!parentDetails.children.includes(student._id)) {
      setParentDetails((prev) => ({
        ...prev,
        children: [...prev.children, student._id],
      }));
    }
    setStudentSearch("");
    setFilteredStudents([]);
  };

  const removeChild = (id) => {
    setParentDetails((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c !== id),
    }));
  };

  // File change
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Normalize bulk row using student full names
  const normalizeParentRow = (row, students) => {
    const normalized = { ...row };
    normalized.name = normalized.name?.trim() || "";
    normalized.email = normalized.email?.trim() || "";
    normalized.phoneNumber = normalized.phoneNumber?.trim() || "";
    normalized.password = normalized.password?.trim() || "";

    if (normalized.children) {
      normalized.children = normalized.children
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((childName) => {
          // match by full name: "firstName lastName"
          const student = students.find(
            (s) =>
              `${s.firstName} ${s.lastName}`.toLowerCase() ===
              childName.toLowerCase()
          );
          return student?._id;
        })
        .filter(Boolean);
    } else {
      normalized.children = [];
    }

    return normalized;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (file) {
        // Bulk upload
        let parsedData = [];
        if (file.name.endsWith(".csv")) {
          parsedData = await new Promise((resolve) => {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => resolve(results.data),
            });
          });
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          parsedData = XLSX.utils.sheet_to_json(sheet);
        } else return alert("Unsupported file type");

        // Normalize rows
        parsedData = parsedData.map((row) => normalizeParentRow(row, students));

        await addParentMutation.mutateAsync({ bulk: parsedData });
        setMessage("✅ Bulk upload successful!");
        setFile(null);
      } else {
        // Single registration
        const { confirmPass, ...dataToSend } = parentDetails;
        await addParentMutation.mutateAsync({ single: dataToSend });
        setMessage("✅ Parent added successfully!");
        setParentDetails(initialParent);
      }
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 overflow-hidden flex justify-center items-start">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Entry */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-4"
        >
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            Add Single Parent
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Name</label>
              <input
                name="name"
                value={parentDetails.name}
                onChange={handleChange}
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
            </div>

            <div>
              <label className="block mb-1">Email</label>
              <input
                name="email"
                value={parentDetails.email}
                onChange={handleChange}
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
            </div>

            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                name="phoneNumber"
                value={parentDetails.phoneNumber}
                onChange={handleChange}
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
            </div>

            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={parentDetails.password}
                onChange={handleChange}
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPass"
                value={parentDetails.confirmPass}
                onChange={handleChange}
                className={`p-2 rounded w-full ${
                  parentDetails.confirmPass === ""
                    ? "bg-gray-800 text-white"
                    : parentDetails.confirmPass === parentDetails.password
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              />
            </div>

            {/* Children */}
            <div className="md:col-span-2">
              <label className="block mb-1">Children</label>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student by name"
                className="p-2 rounded bg-gray-800 text-white w-full"
              />
              {filteredStudents.length > 0 && (
                <ul className="bg-gray-800 rounded mt-1 max-h-40 overflow-y-auto">
                  {filteredStudents.map((s) => (
                    <li
                      key={s._id}
                      className="p-2 cursor-pointer hover:bg-gray-700"
                      onClick={() => addChild(s)}
                    >
                      {s.firstName} {s.lastName} — {s.classLevel}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {parentDetails.children.map((id) => {
                  const student = students.find((s) => s._id === id);
                  if (!student) return null;
                  return (
                    <span
                      key={id}
                      className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {student.firstName} {student.lastName}
                      <button
                        type="button"
                        onClick={() => removeChild(id)}
                        className="ml-1 text-xs text-red-200 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canRegister}
            className={`mt-6 py-2 rounded font-semibold w-full ${
              canRegister
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Add Parent
          </button>

          {message && (
            <p
              className={`${
                message.startsWith("✅") ? "text-green-400" : "text-red-500"
              } mt-3 text-center`}
            >
              {message}
            </p>
          )}
        </form>

        {/* Bulk Upload */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-4"
        >
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            Bulk Upload
          </h2>

          {/* Hint */}
          <div className="bg-gray-800 p-3 rounded mb-3 text-gray-300 text-sm">
            <p>Expected headers for bulk upload:</p>
            <ul className="list-disc list-inside">
              <li>name</li>
              <li>email</li>
              <li>phoneNumber</li>
              <li>password</li>
              <li>children (comma-separated student full names)</li>
            </ul>
            <p>Notes:</p>
            <ul className="list-disc list-inside">
              <li>Child names must match students exactly: e.g., "Kamau Njogu"</li>
              <li>If a child cannot be found, it will be ignored</li>
            </ul>
          </div>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          {file && <p className="text-gray-300 mt-2">Selected file: {file.name}</p>}
          <button
            type="submit"
            disabled={!file}
            className={`mt-4 py-2 rounded font-semibold w-full ${
              file
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Upload File
          </button>
        </form>
      </div>
    </main>
  );
};

export default ParentForm;
