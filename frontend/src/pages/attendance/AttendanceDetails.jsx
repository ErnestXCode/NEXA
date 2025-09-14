import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const AttendanceDetails = ({ days = 7 }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newReason, setNewReason] = useState("");

  const academicYear = "2025";
  const term = "Term 1";

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
      const res = await api.patch(`/attendance/${editingRecord._id}`, {
        reason: newReason,
      });

      // Update local state
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
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
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
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-600"
                      onClick={() => openModal(rec)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
