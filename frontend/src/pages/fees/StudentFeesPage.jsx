import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router-dom";

const StudentFeesPage = () => {
  const { studentId } = useParams();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get(`/fees/student/${studentId}/history`);
        setRecords(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch fee records");
      }
    };
    fetchRecords();
  }, [studentId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fee History</h1>
      <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
        <thead className="bg-gray-900">
          <tr>
            <th className="p-2">Term</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Type</th>
            <th className="p-2">Method</th>
            <th className="p-2">Date</th>
            <th className="p-2">Handled By</th>
            <th className="p-2">Note</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r._id} className="border-t border-gray-700">
              <td className="p-2">{r.term}</td>
              <td className="p-2">KES {r.amount.toLocaleString()}</td>
              <td className="p-2 capitalize">{r.type}</td>
              <td className="p-2 capitalize">{r.method}</td>
              <td className="p-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2">{r.handledBy ? r.handledBy.name : "—"}</td>
              <td className="p-2">{r.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentFeesPage;
