// src/pages/students/StudentForm.jsx
import React, { useState } from "react";
import api from "../../api/axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const studentObj = {
  middleName: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  classLevel: "",
};

const normalizeStudentData = (data) => {
  return data.map((s) => ({
    middleName: s.middleName?.trim() || "",
    firstName: s.firstName?.trim() || "",
    lastName: s.lastName?.trim() || "",
    gender: s.gender?.toLowerCase() === "female" ? "female" : "male", // default to male if unknown
    dateOfBirth: s.dateOfBirth || "",
    classLevel: s.classLevel?.trim() || "",
  }));
};

const StudentForm = ({ onNext }) => {
  const [student, setStudent] = useState(studentObj);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const { data: schoolData = {} } = useQuery({
    queryKey: ["schoolData"],
    queryFn: async () => {
      const res = await api.get("/schools/me");
      return res.data || {};
    },
  });
  const classLevels = schoolData.classLevels || [];

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

  const downloadStudentTemplate = () => {
  // Define headers
  const headers = [
    "firstName",
    "middleName",
    "lastName",
    "gender",
    "dateOfBirth",
    "classLevel",
  ];

  // Example row
  const exampleData = [
    [
      "John",        // firstName
      "Dan",         // middleName
      "Doe",         // lastName
      "male",        // gender
      "2010-05-15",  // dateOfBirth (yyyy-mm-dd)
      "Grade 1",     // classLevel
    ],
    [
      "Mary",
      "Jane",
      "Smith",
      "female",
      "2011-08-22",
      "Grade 2",
    ],
  ];

  // Combine headers + example rows
  const worksheetData = [headers, ...exampleData];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Create workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "StudentTemplate");

  // Trigger download
  XLSX.writeFile(wb, "StudentTemplate.xlsx");
};


  return (
    <main className="p-6 bg-gray-950 overflow-hidden flex justify-center items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl grid gap-4 grid-cols-1 md:grid-cols-2"
      >
        <h1 className="text-2xl font-bold text-white col-span-2">
          Add Student
        </h1>

        {/* Single Entry Inputs with labels */}

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
          <label className="text-gray-300 text-sm mb-1">Middle Name</label>
          <input
            placeholder="e.g Dan"
            name="middleName"
            value={student.middleName}
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
            <select
              name="classLevel"
              value={student.classLevel}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800 text-white"
            >
              <option value="">Select Class Level</option>
              {classLevels.map((level) => (
                <option key={level.name} value={level.name}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
      

        {/* Bulk upload */}
        <div className="col-span-2">
          <label className="block text-gray-300 text-sm mb-1">
            Or upload CSV / Excel for bulk
          </label>
          <p className="text-gray-400 text-sm mb-1">
            Expected columns for CSV / Excel: <br />
            <strong>
              firstName,middleName, lastName, gender, dateOfBirth, classLevel
            </strong>
          </p>
          <button
  type="button"
  onClick={downloadStudentTemplate}
  className="mb-3 py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-500"
>
  Download Excel Template
</button>

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
          disabled={!file && !student.middleName}
          className={`py-2 rounded font-semibold col-span-2 ${
            file || student.middleName
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
