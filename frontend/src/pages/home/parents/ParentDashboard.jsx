import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [childExams, setChildExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/personel/parent/dashboard");
      setChildren(res.data.children);
      if (res.data.children.length > 0) setSelectedChild(res.data.children[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceSummary = async (studentId) => {
    try {
      const res = await api.get(
        `/personel/parent/attendance-summary?studentId=${studentId}`
      );
      setAttendanceSummary(res.data);
    } catch (err) {
      console.error(err);
      setAttendanceSummary(null);
    }
  };

  const fetchChildExams = async (studentId) => {
    try {
      const res = await api.get(
        `/personel/parent/children-exams?studentId=${studentId}`
      );
      setChildExams(res.data.results || []);
      setSelectedExamId(null);
    } catch (err) {
      console.error(err);
      setChildExams([]);
      setSelectedExamId(null);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceSummary(selectedChild._id);
      fetchChildExams(selectedChild._id);
    } else {
      setAttendanceSummary(null);
      setChildExams([]);
      setSelectedExamId(null);
    }
  }, [selectedChild]);

  return (
    <div className="p-4 sm:p-6 space-y-8 min-h-screen bg-gray-950 text-gray-200">
      {/* Child Selection */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {children.map((child) => (
            <button
              key={child._id}
              onClick={() => setSelectedChild(child)}
              className={`px-5 py-2 rounded-full font-medium transition duration-200 shadow-md ${
                selectedChild?._id === child._id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {child.firstName} {child.lastName}
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <div className="space-y-8">
          {/* Child Info */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
              Student Information
            </h2>
            <div className="space-y-2 text-sm sm:text-base">
              <p>
                <span className="font-semibold text-gray-300">Name:</span>{" "}
                {selectedChild.firstName} {selectedChild.middleName}{" "}
                {selectedChild.lastName}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Class:</span>{" "}
                {selectedChild.classLevel}
              </p>
              {/* <p>
                <span className="font-semibold text-gray-300">Stream:</span>{" "}
                {selectedChild.stream || "-"}
              </p> */}
            </div>
          </div>

          {/* Fees Summary */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
              Fees Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["Term 1", "Term 2", "Term 3"].map((term) => {
                const fees = selectedChild.feesByTerm?.[term] || {};
                return (
                  <div
                    key={term}
                    className="bg-gray-950 p-4 rounded-xl shadow text-center hover:bg-gray-900 transition"
                  >
                    <h3 className="font-semibold text-gray-200 mb-2">{term}</h3>
                    <p className="text-gray-400 text-sm">
                      Expected:{" "}
                      <span className="font-medium text-gray-300">
                        KES {fees.expected || 0}
                      </span>
                    </p>
                    <p className="text-green-400 text-sm">
                      Paid: KES {fees.paid || 0}
                    </p>
                    <p className="text-yellow-400 text-sm">
                      Adjustments: KES {fees.adjustments || 0}
                    </p>
                    <p className="text-red-400 text-sm">
                      Outstanding: KES {fees.outstanding || 0}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MPESA Pay Section */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Pay Fees via MPESA
            </h2>
            <p className="text-gray-400 mb-2">
              To pay your child's school fees, use MPESA and send the amount to:
            </p>
            <p className="font-bold text-blue-400 text-lg sm:text-xl">
              +254 xxx xxx xxx
            </p>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              After payment, please inform the school to update your payment
              status.
            </p>
          </div>

          {/* Attendance Summary */}
          {attendanceSummary && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
                Attendance Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["Present", "Absent", "Late"].map((status, idx) => {
                  const colors = ["green-400", "red-400", "yellow-400"];
                  return (
                    <div
                      key={idx}
                      className="bg-gray-950 p-4 rounded-xl shadow text-center"
                    >
                      <p className="text-gray-400">{status}</p>
                      <p
                        className={`font-bold text-${colors[idx]} mt-2 text-lg`}
                      >
                        {status === "Present"
                          ? `${attendanceSummary.present} days`
                          : status === "Absent"
                          ? `${attendanceSummary.absent} days`
                          : `${attendanceSummary.late} days`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
