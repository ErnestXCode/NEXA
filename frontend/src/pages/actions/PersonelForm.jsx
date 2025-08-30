import React, { useState } from "react";
import api from "../../api/axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const registerObj = { role: "", name: "", email: "", password: "", confirmPass: "" };

const PersonelForm = () => {
  const [registerDetails, setRegisterDetails] = useState(registerObj);
  const [file, setFile] = useState(null);
  const [canRegister, setCanRegister] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const updated = { ...registerDetails, [e.target.name]: e.target.value };
    setRegisterDetails(updated);
    setCanRegister(
      updated.role &&
      updated.name &&
      updated.email &&
      updated.password &&
      updated.confirmPass === updated.password
    );
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (file) {
        // BULK mode
        let parsedData = [];
        if (file.name.endsWith(".csv")) {
          parsedData = await new Promise((resolve) => {
            Papa.parse(file, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data) });
          });
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(sheet);
        } else return alert("Unsupported file type");

        await api.post("/auth/registerpersonel/bulk", { personnel: parsedData });
        setMessage("✅ Bulk upload successful!");
      } else {
        // SINGLE ENTRY mode
        const { confirmPass, ...dataToSend } = registerDetails;
        await api.post("/auth/registerpersonel", dataToSend);
        setMessage("✅ Single personnel added!");
        setRegisterDetails(registerObj);
      }
      setFile(null);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <main className="p-6 bg-gray-950 min-h-screen flex justify-center items-start">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Single Entry Card */}
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white mb-2">Add Single Personnel</h2>
          <p className="text-gray-400 mb-4">Fill out the form below to add one person.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Role</label>
              <select name="role" value={registerDetails.role} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white w-full">
                <option value="" disabled>Select role</option>
                <option value="teacher">Teacher</option>
                <option value="bursar">Bursar</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Name</label>
              <input name="name" value={registerDetails.name} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white w-full" />
            </div>

            <div>
              <label className="block mb-1">Email</label>
              <input name="email" value={registerDetails.email} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white w-full" />
            </div>

            <div>
              <label className="block mb-1">Password</label>
              <input type="password" name="password" value={registerDetails.password} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white w-full" />
            </div>

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
                    : registerDetails.confirmPass === registerDetails.password
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canRegister}
            className={`mt-4 py-2 rounded font-semibold w-full ${canRegister ? "bg-white text-black hover:bg-gray-200" : "bg-gray-500 cursor-not-allowed"}`}
          >
            Add Personnel
          </button>
        </form>

        {/* Bulk Upload Card */}
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white mb-2">Bulk Upload</h2>
          <p className="text-gray-400 mb-4">Upload CSV or Excel file to add multiple personnel at once.</p>

          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="p-2 rounded bg-gray-800 text-white" />
          
          {file && <p className="text-gray-300 mt-2">Selected file: {file.name}</p>}

          <button
            type="submit"
            disabled={!file}
            className={`mt-4 py-2 rounded font-semibold w-full ${file ? "bg-white text-black hover:bg-gray-200" : "bg-gray-500 cursor-not-allowed"}`}
          >
            Upload File
          </button>
        </form>

        {/* Message Section */}
        {message && (
          <div className="md:col-span-2 text-center">
            <p className={`${message.startsWith("✅") ? "text-green-400" : "text-red-500"} text-lg font-medium`}>{message}</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default PersonelForm;
