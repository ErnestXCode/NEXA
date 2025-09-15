import React, { useState } from "react";
import * as XLSX from "xlsx";
import api from "../../api/axios";

const AddFeeBulkPage = () => {
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [academicYear, setAcademicYear] = useState("2025/2026"); // default

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet).map((row) => ({
        ...row,
        firstName: row.firstName?.trim(),
        middleName: row.middleName?.trim(),
        lastName: row.lastName?.trim(),
        classLevel: row.classLevel?.trim(),
        term: row.term?.trim(),
        balance: Number(row.balance),
      }));
      setRecords(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (!records.length) return alert("No records to submit");

    // Validate required fields
    const invalidRows = records.filter(
      (r) =>
        !r.firstName || !r.lastName || !r.classLevel || !r.term || r.balance == null
    );
    if (invalidRows.length > 0) {
      return alert(`Some rows are missing required fields: ${invalidRows.length}`);
    }

    setUploading(true);
    try {
      const res = await api.post("/fees/bulk-onboarding", {
        rows: records,
        academicYear,
      });
      alert(`Created: ${res.data.created}, Skipped: ${res.data.skipped.length}`);
      setRecords([]);
    } catch (err) {
      alert(err.response?.data?.message || "Error uploading balances");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-6 bg-gray-950 text-gray-100 rounded-md shadow-md">
      <div className="text-gray-300 text-sm">
        <p>
          <strong>Instructions:</strong> Prepare your Excel/CSV file with the following columns:
        </p>
        <ul className="list-disc ml-6 mt-1">
          <li><strong>firstName</strong> - Student's first name</li>
          <li><strong>middleName</strong> - Student's middle name (can be blank)</li>
          <li><strong>lastName</strong> - Student's last name</li>
          <li><strong>classLevel</strong> - E.g., "Grade 1", "Grade 2", etc.</li>
          <li><strong>term</strong> - One of "Term 1", "Term 2", "Term 3"</li>
          <li><strong>balance</strong> - The opening balance amount</li>
        </ul>
        <p className="mt-2">
          Academic year will default to <strong>{academicYear}</strong>. Make sure names match exactly with existing students.
        </p>
      </div>

      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-300
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700"
      />

      {records.length > 0 && (
        <div className="overflow-x-auto max-h-64 border border-gray-700 rounded">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                {Object.keys(records[0]).map((key) => (
                  <th key={key} className="px-2 py-1 border border-gray-700">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-gray-900">
                  {Object.values(r).map((v, j) => (
                    <td key={j} className="px-2 py-1 border border-gray-700">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {records.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          {uploading ? "Uploading..." : "Submit Opening Balances"}
        </button>
      )}
    </div>
  );
};

export default AddFeeBulkPage;
