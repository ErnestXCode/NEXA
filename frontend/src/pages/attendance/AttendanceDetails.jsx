import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const AttendanceDetails = ({ days = 7 }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newReason, setNewReason] = useState("");
  const [expandedDates, setExpandedDates] = useState([]);

  const currentYear = new Date().getFullYear();
  const [academicYear, setAcademicYear] = useState(
    `${currentYear}/${currentYear + 1}`
  );
  const [term, setTerm] = useState("Term 1");

  const fetchData = async () => {
    setLoading(true);
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

  const openModal = (record) => {
    setEditingRecord(record);
    setNewReason(record.reason || "");
  };

  const closeModal = () => {
    setEditingRecord(null);
    setNewReason("");
  };

  const saveReason = async () => {
    try {
      await api.patch(`/attendance/${editingRecord._id}`, {
        reason: newReason,
      });
      setRecords((prev) =>
        prev.map((r) =>
          r._id === editingRecord._id ? { ...r, reason: newReason } : r
        )
      );
      closeModal();
    } catch (err) {
      console.error("Failed to update reason", err);
    }
  };

  // Group by date
  const groupedRecords = records.reduce((acc, rec) => {
    const dateKey = new Date(rec.date).toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(rec);
    return acc;
  }, {});

  const toggleDate = (date) => {
    setExpandedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

  if (loading) return <p>Loading attendance details...</p>;

  return (
    <div className="bg-gray-950 shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-900 pb-2">
        Absentees & Late Students (Last {days} days)
      </h2>

      {Object.keys(groupedRecords).length === 0 && (
        <p className="text-gray-400 text-center py-4">No records found</p>
      )}

      {Object.entries(groupedRecords)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .map(([date, records]) => (
          <div key={date} className="border border-gray-800 rounded-lg mb-3">
            <button
              onClick={() => toggleDate(date)}
              className="w-full text-left px-4 py-3 bg-gray-900 flex justify-between items-center"
            >
              <span className="font-medium">{new Date(date).toDateString()}</span>
              <span className="text-gray-400">
                {records.length} record{records.length > 1 ? "s" : ""}
              </span>
            </button>

            {expandedDates.includes(date) && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-t border-gray-800 text-white">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="px-4 py-2 text-left">Student Name</th>
                      <th className="px-4 py-2 text-left">Class</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec._id} className="border-t border-gray-800">
                        <td className="px-4 py-2">{rec.studentName}</td>
                        <td className="px-4 py-2">{rec.classLevel}</td>
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
                        <td className="px-4 py-2">
                          <button
                            className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-600"
                            onClick={() => openModal(rec)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

      {/* Modal */}
      {editingRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-96">
            <h3 className="text-lg font-semibold mb-4">
              Edit Reason for {editingRecord.studentName}
            </h3>
            <textarea
              className="w-full p-2 rounded bg-gray-800 text-white mb-4"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-700"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                onClick={saveReason}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDetails;
