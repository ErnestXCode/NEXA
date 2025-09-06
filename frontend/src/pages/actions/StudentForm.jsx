// src/pages/students/StudentForm.jsx
import React, { useState } from "react";
import api from "../../api/axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const studentObj = {
  admissionNumber: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  classLevel: "",
  guardianName: "",
  guardianPhone: "",
};

const normalizeStudentData = (data) => {
  return data.map((s) => ({
    admissionNumber: s.admissionNumber?.trim() || "",
    firstName: s.firstName?.trim() || "",
    lastName: s.lastName?.trim() || "",
    gender:
      s.gender?.toLowerCase() === "female"
        ? "female"
        : "male", // default to male if unknown
    dateOfBirth: s.dateOfBirth || "",
    classLevel: s.classLevel?.trim() || "",
    guardianName: s.guardianName?.trim() || "",
    guardianPhone: s.guardianPhone?.trim() || "",
  }));
};

const StudentForm = ({ onNext }) => {
  const [student, setStudent] = useState(studentObj);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const addStudentMutation = useMutation({
    mutationFn: (newStudent) => api.post("/students", newStudent),
    onSuccess: () => {
      queryClient.refetchQueries(["students"]);
      setMessage("✅ Student added successfully!");
      setStudent(studentObj);
      setFile(null);
      if (onNext) onNext();
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (students) => api.post("/students/bulk", { students }),
    onSuccess: () => {
      queryClient.refetchQueries(["students"]);
      setMessage("✅ Bulk upload successful!");
      setFile(null);
      if (onNext) onNext();
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    },
  });

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (file) {
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
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(sheet);
        } else {
          return alert("Unsupported file type");
        }

        // Normalize the bulk data
        parsedData = normalizeStudentData(parsedData);

        bulkUploadMutation.mutate(parsedData);
      } else {
        addStudentMutation.mutate(student);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 min-h-screen flex justify-center items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl grid gap-4 grid-cols-1 md:grid-cols-2"
      >
        <h1 className="text-2xl font-bold text-white col-span-2">
          Add Student
        </h1>

        {/* Single Entry Inputs with labels */}
        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Admission Number</label>
          <input
            placeholder="e.g. 12345"
            name="admissionNumber"
            value={student.admissionNumber}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">First Name</label>
          <input
            placeholder="e.g. John"
            name="firstName"
            value={student.firstName}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Last Name</label>
          <input
            placeholder="e.g. Doe"
            name="lastName"
            value={student.lastName}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Gender</label>
          <select
            name="gender"
            value={student.gender}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={student.dateOfBirth}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]} // no future dates
            className="p-2 rounded bg-gray-800 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Please select the student's birthday
          </p>
        </div>

        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Class Level</label>
          <input
            placeholder="e.g. Grade 4"
            name="classLevel"
            value={student.classLevel}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Guardian Name</label>
          <input
            placeholder="e.g. Mary Doe"
            name="guardianName"
            value={student.guardianName}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div className="col-span-1 flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Guardian Phone</label>
          <input
            placeholder="e.g. 0712345678"
            name="guardianPhone"
            value={student.guardianPhone}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {/* Bulk upload */}
        <div className="col-span-2">
          <p className="text-gray-400 text-sm mb-1">
            Expected columns for CSV / Excel: <br />
            <strong>
              admissionNumber, firstName, lastName, gender, dateOfBirth,
              classLevel, guardianName, guardianPhone
            </strong>
          </p>
          <label className="block text-gray-300 text-sm mb-1">
            Or upload CSV / Excel for bulk
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="p-2 rounded bg-gray-800 text-white w-full"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!file && !student.admissionNumber}
          className={`py-2 rounded font-semibold col-span-2 ${
            file || student.admissionNumber
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          {file ? "Upload File" : "Add Student"}
        </button>

        {message && (
          <p
            className={`col-span-2 ${
              message.startsWith("✅") ? "text-green-400" : "text-red-500"
            } mt-2`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  );
};

export default StudentForm;
