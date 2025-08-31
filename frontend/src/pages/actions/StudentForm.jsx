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

const StudentForm = () => {
  const [student, setStudent] = useState(studentObj);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  // Mutation for single student
  const addStudentMutation = useMutation({
    mutationFn: (newStudent) => api.post("/students", newStudent),
    onSuccess: () => {
      queryClient.refetchQueries(["students"]);
      setMessage("✅ Student added successfully!");
      setStudent(studentObj);
      setFile(null);
    },
    onError: (err) => {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    },
  });

  // Mutation for bulk upload
  const bulkUploadMutation = useMutation({
    mutationFn: (students) => api.post("/students/bulk", { students }),
    onSuccess: () => {
      queryClient.refetchQueries(["students"]);
      setMessage("✅ Bulk upload successful!");
      setFile(null);
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
        <h1 className="text-2xl font-bold text-white col-span-2">Add Student</h1>

        {/* Single Entry Inputs */}
        <input
          placeholder="Admission Number"
          name="admissionNumber"
          value={student.admissionNumber}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <input
          placeholder="First Name"
          name="firstName"
          value={student.firstName}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <input
          placeholder="Last Name"
          name="lastName"
          value={student.lastName}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <select
          name="gender"
          value={student.gender}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          type="date"
          name="dateOfBirth"
          value={student.dateOfBirth}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <input
          placeholder="Class"
          name="classLevel"
          value={student.classLevel}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <input
          placeholder="Guardian Name"
          name="guardianName"
          value={student.guardianName}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />
        <input
          placeholder="Guardian Phone"
          name="guardianPhone"
          value={student.guardianPhone}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 text-white col-span-1"
        />

        {/* Bulk upload */}
        <div className="col-span-2">
          <label className="block mb-1">Or upload CSV / Excel for bulk</label>
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
