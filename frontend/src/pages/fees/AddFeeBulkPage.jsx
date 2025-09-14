import React, { useState } from "react";
import * as XLSX from "xlsx";
import api from "../../api/axios";

const AddFeeBulkPage = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select an Excel file first");

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Expected columns: studentId, amount, type, term, academicYear, method, note
    try {
      const res = await api.post("/fees/bulk", { fees: rows });
      alert(`Uploaded ${res.data.count} fees successfully`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error uploading fees");
    }
  };

  return (
    <div className="p-6 bg-gray-950 text-gray-100 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Bulk Fee Upload</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleUpload} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
        Upload
      </button>
      <p className="mt-4 text-gray-400 text-sm">
        Excel columns: firstName, middleName, lastName, classLevel, amount, type, term, academicYear, method, note
      </p>
    </div>
  );
};

export default AddFeeBulkPage;
