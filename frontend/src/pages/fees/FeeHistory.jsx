import React, { useEffect, useState } from "react";
import api from "../../api/axios";



const FeeHistory = ({ studentId }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!studentId) return;
    api.get(`/fees/student/${studentId}`).then(res => setRecords(res.data));
  }, [studentId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Fee History</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Date</th>
            <th>Term</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Method</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r._id}>
              <td>{new Date(r.date).toLocaleDateString()}</td>
              <td>{r.term}</td>
              <td>{r.amount}</td>
              <td>{r.type}</td>
              <td>{r.method}</td>
              <td>{r.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeeHistory;
