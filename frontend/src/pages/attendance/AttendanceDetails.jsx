import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const AttendanceDetails = ({ days = 7 }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 Use actual values from context, Redux, or API if available
  const academicYear = "2025";
  const term = "Term 1";

  const fetchData = async () => {
    try {
      const res = await api.get("/attendance/details", {
        params: { days, academicYear, term },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  if (loading) return <p>Loading attendance details...</p>;

  return (
    <div className="bg-gray-950 shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">
        Absentees & Late Students (Last {days} days)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-800 text-white">
          <thead>
            <tr className="bg-gray-900 text-left">
              <th className="px-4 py-2">Student Name</th>
              <th className="px-4 py-2">Class</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-400"
                >
                  No records found
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{rec.studentName}</td>
                  <td className="px-4 py-2">{rec.classLevel}</td>
                  <td className="px-4 py-2">
                    {new Date(rec.date).toLocaleDateString()}
                  </td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      rec.status === "absent"
                        ? "text-red-500"
                        : "text-yellow-400"
                    }`}
                  >
                    {rec.status}
                  </td>
                  <td className="px-4 py-2">{rec.reason || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDetails;
