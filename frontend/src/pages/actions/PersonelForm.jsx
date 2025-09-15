// src/pages/personnel/PersonelForm.jsx
import React, { useState } from "react";
import api from "../../api/axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const registerObj = {
  role: "",
  name: "",
  email: "",
  password: "",
  confirmPass: "",
  phoneNumber: "",
  subjects: [],
  isClassTeacher: false,
  classLevel: "",
};

const patterns = {
  name: /^[a-zA-Z\s]{3,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneNumber: /^(?:\+254|0)(?:7|1)\d{8}$/, // Kenyan phone format: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, // min 6, letter+digit
};

const errorMessages = {
  name: "Name should be 3–50 letters only.",
  email: "Enter a valid email (e.g. example@school.ac.ke).",
  phoneNumber:
    "Phone must start with +2547 / +2541 / 07 / 01 and have 10 digits (e.g. 0712345678).",
  password:
    "Password must be at least 6 characters with at least 1 letter and 1 number.",
  confirmPass: "Passwords do not match.",
};

const PersonelForm = ({ onNext }) => {
  const [registerDetails, setRegisterDetails] = useState(registerObj);
  const [file, setFile] = useState(null);
  const [canRegister, setCanRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  const { data: schoolData = {}, isLoading: subjectsLoading } = useQuery({
    queryKey: ["schoolData"],
    queryFn: async () => {
      const res = await api.get("/schools/me");
      return res.data || {};
    },
  });
  const schoolSubjects = schoolData.subjects || [];
  const classLevels = schoolData.classLevels || [];

  const queryClient = useQueryClient();

  const addPersonnelMutation = useMutation({
    mutationFn: async (data) => {
      if (data.bulk) {
        return api.post("/auth/registerpersonel/bulk", {
          personnel: data.bulk,
        });
      } else {
        return api.post("/auth/registerpersonel", data.single);
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["teachers"], exact: true });
      queryClient.refetchQueries({ queryKey: ["bursars"], exact: true });
      if (onNext) onNext();
    },
  });

  const validateField = (field, value) => {
    if (field === "confirmPass") {
      return value === registerDetails.password;
    }
    if (!patterns[field]) return true;
    return patterns[field].test(value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updated = { ...registerDetails };
    updated[name] = type === "checkbox" ? checked : value;
    setRegisterDetails(updated);

    const allValid =
      updated.role &&
      validateField("name", updated.name) &&
      validateField("email", updated.email) &&
      validateField("phoneNumber", updated.phoneNumber) &&
      validateField("password", updated.password) &&
      validateField("confirmPass", updated.confirmPass);

    setCanRegister(allValid);
  };

  const removeSubject = (subj) => {
    setRegisterDetails((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subj),
    }));
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
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          parsedData = XLSX.utils.sheet_to_json(sheet);
        } else return alert("Unsupported file type");

        parsedData = parsedData.map((row) => {
          row.isClassTeacher =
            row.isClassTeacher &&
            row.isClassTeacher.toString().toLowerCase() === "true";
          if (!row.isClassTeacher) row.classLevel = "";
          if (row.role) row.role = row.role.toLowerCase().trim();
          if (row.subjects) {
            row.subjects = row.subjects
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          } else row.subjects = [];
          return row;
        });

        await addPersonnelMutation.mutateAsync({ bulk: parsedData });
        setMessage("✅ Bulk upload successful!");
      } else {
        const { confirmPass, ...dataToSend } = registerDetails;
        await addPersonnelMutation.mutateAsync({ single: dataToSend });
        setMessage("✅ Single personnel added!");
        setRegisterDetails(registerObj);
        setShowTeacherModal(false);
      }
      setFile(null);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 overflow-hidden flex justify-center items-start">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Single Entry --- */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-4"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Add Single Personnel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                name="name"
                value={registerDetails.name}
                onChange={handleChange}
                className={`p-2 rounded w-full ${
                  registerDetails.name === ""
                    ? "bg-gray-800 text-white"
                    : validateField("name", registerDetails.name)
                    ? "bg-gray-800 text-white"
                    : "bg-red-600 text-white"
                }`}
              />
              {!validateField("name", registerDetails.name) &&
                registerDetails.name && (
                  <p className="text-red-400 text-sm mt-1">
                    {errorMessages.name}
                  </p>
                )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1">Email</label>
              <input
                name="email"
                value={registerDetails.email}
                onChange={handleChange}
                className={`p-2 rounded w-full ${
                  registerDetails.email === ""
                    ? "bg-gray-800 text-white"
                    : validateField("email", registerDetails.email)
                    ? "bg-gray-800 text-white"
                    : "bg-red-600 text-white"
                }`}
              />
              {!validateField("email", registerDetails.email) &&
                registerDetails.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errorMessages.email}
                  </p>
                )}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                name="phoneNumber"
                value={registerDetails.phoneNumber}
                onChange={handleChange}
                className={`p-2 rounded w-full ${
                  registerDetails.phoneNumber === ""
                    ? "bg-gray-800 text-white"
                    : validateField("phoneNumber", registerDetails.phoneNumber)
                    ? "bg-gray-800 text-white"
                    : "bg-red-600 text-white"
                }`}
              />
              {!validateField("phoneNumber", registerDetails.phoneNumber) &&
                registerDetails.phoneNumber && (
                  <p className="text-red-400 text-sm mt-1">
                    {errorMessages.phoneNumber}
                  </p>
                )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={registerDetails.password}
                onChange={handleChange}
                className={`p-2 rounded w-full ${
                  registerDetails.password === ""
                    ? "bg-gray-800 text-white"
                    : validateField("password", registerDetails.password)
                    ? "bg-gray-800 text-white"
                    : "bg-red-600 text-white"
                }`}
              />
              {!validateField("password", registerDetails.password) &&
                registerDetails.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {errorMessages.password}
                  </p>
                )}
            </div>

            {/* Confirm Password */}
            <div className="md:col-span-2">
              <label className="block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPass"
                value={registerDetails.confirmPass}
                onChange={handleChange}
                className={`p-2 rounded w-full ${
                  registerDetails.confirmPass === ""
                    ? "bg-gray-800 text-white"
                    : validateField("confirmPass", registerDetails.confirmPass)
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              />
              {!validateField("confirmPass", registerDetails.confirmPass) &&
                registerDetails.confirmPass && (
                  <p className="text-red-400 text-sm mt-1">
                    {errorMessages.confirmPass}
                  </p>
                )}
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <label className="block mb-1">Role</label>
              <select
                name="role"
                value={registerDetails.role}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === "teacher") setShowTeacherModal(true);
                }}
                className="p-2 rounded bg-gray-800 text-white w-full"
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="teacher">Teacher</option>
                <option value="bursar">Bursar</option>
              </select>
            </div>
          </div>

          {registerDetails.role === "teacher" && (
            <div className="mt-2 p-3 bg-gray-800 rounded text-gray-200 text-sm">
              <p>
                <strong>Subjects:</strong>{" "}
                {registerDetails.subjects.length
                  ? registerDetails.subjects.join(", ")
                  : "None"}
              </p>
              {registerDetails.isClassTeacher && (
                <p>
                  <strong>Class Teacher of:</strong>{" "}
                  {registerDetails.classLevel || "Not set"}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!canRegister}
            className={`mt-4 py-2 rounded font-semibold w-full ${
              canRegister
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Add Personnel
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

        {/* --- Bulk Upload --- */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-4"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Bulk Upload</h2>

          <div className="bg-gray-800 p-3 rounded mb-3 text-gray-300 text-sm">
            <p>Expected headers for bulk upload:</p>
            <ul className="list-disc list-inside">
              <li>name</li>
              <li>email</li>
              <li>phoneNumber</li>
              <li>role (teacher / bursar)</li>
              <li>password</li>
              <li>isClassTeacher (true / false)</li>
              <li>classLevel (only required if isClassTeacher is true)</li>
              <li>subjects (comma-separated, only for teachers)</li>
            </ul>
          </div>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="p-2 rounded bg-gray-800 text-white"
          />
          {file && (
            <p className="text-gray-300 mt-2">Selected file: {file.name}</p>
          )}
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

      {/* --- Teacher Modal --- */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              Teacher Details
            </h3>

            <label className="block text-gray-300 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {registerDetails.subjects.map((subj, idx) => (
                <span
                  key={idx}
                  className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {subj}
                  <button
                    type="button"
                    onClick={() => removeSubject(subj)}
                    className="ml-1 text-xs text-red-200 hover:text-red-400"
                  >
                    ✕
                  </button>
                </span>
              ))}

              {subjectsLoading ? (
                <p className="text-gray-400">Loading subjects...</p>
              ) : (
                <select
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const value = e.target.value;
                    if (!registerDetails.subjects.includes(value)) {
                      setRegisterDetails((prev) => ({
                        ...prev,
                        subjects: [...prev.subjects, value],
                      }));
                    }
                    e.target.value = "";
                  }}
                  className="flex-1 min-w-[120px] p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Select subject...</option>
                  {schoolSubjects
                    .filter((s) => !registerDetails.subjects.includes(s))
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <label className="flex items-center gap-2 mb-3 text-gray-300">
              <input
                type="checkbox"
                name="isClassTeacher"
                checked={registerDetails.isClassTeacher}
                onChange={handleChange}
              />
              Is Class Teacher?
            </label>

            {registerDetails.isClassTeacher && (
              <div className="mb-3">
                <label className="block text-gray-300 mb-1">Class Level</label>
                <select
                  name="classLevel"
                  value={registerDetails.classLevel || ""}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 text-white w-full"
                >
                  <option value="">Select Class Level</option>
                  {classLevels.map((level) => (
                    <option key={level.name} value={level.name}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTeacherModal(false)}
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PersonelForm;
