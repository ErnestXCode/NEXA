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
    <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-950 text-gray-200">
      {/* Child Selection */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 justify-center">
          {children.map((child) => (
            <button
              key={child._id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 sm:px-5 py-1 sm:py-2 rounded-full font-medium transition-colors duration-200 ${
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
        <div className="space-y-6 sm:space-y-8">
          {/* Child Info */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>
                <span className="font-semibold text-gray-300">Name:</span>{" "}
                {selectedChild.firstName} {selectedChild.middleName} {selectedChild.lastName}
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
            {["Total Paid", "Adjustments", "Outstanding", "Current Term"].map(
              (label, i) => {
                const colors = [
                  "green-400",
                  "yellow-400",
                  "red-400",
                  "blue-400",
                ];
                const value =
                  label === "Total Paid"
                    ? selectedChild.feesSummary?.paid || 0
                    : label === "Adjustments"
                    ? selectedChild.feesSummary?.adjustments || 0
                    : label === "Outstanding"
                    ? selectedChild.feesSummary?.outstanding || 0
                    : selectedChild.currentTerm || "-";

                return (
                  <div
                    key={i}
                    className="bg-gray-950 p-3 sm:p-4 rounded-xl shadow text-center text-sm sm:text-base"
                  >
                    <p className="text-gray-400">{label}</p>
                    <p className={`font-bold text-${colors[i]} mt-1 sm:mt-2`}>
                      {label !== "Current Term" ? `KES ${value}` : value}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          {/* MPESA Pay Section */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6 rounded-2xl shadow-md mt-4 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Pay Fees via MPESA
            </h2>
            <p className="text-gray-400 mb-2">
              To pay your child's school fees, use MPESA and send the amount to:
            </p>
            <p className="font-bold text-blue-400 text-lg sm:text-xl">
              +254 700 123 456
            </p>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              After payment, please inform the school to update your payment
              status.
            </p>
          </div>

          {/* Attendance Summary */}
          {attendanceSummary && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 border-b border-gray-700 pb-1 sm:pb-2">
                Attendance Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                {["Present", "Absent", "Late"].map((status, idx) => {
                  const colors = ["green-400", "red-400", "yellow-400"];
                  return (
                    <div
                      key={idx}
                      className="bg-gray-950 p-2 sm:p-4 rounded-xl shadow text-center text-sm sm:text-base"
                    >
                      <p className="text-gray-400">{status}</p>
                      <p
                        className={`font-bold text-${colors[idx]} mt-1 sm:mt-2`}
                      >
                        {status === "Present"
                          ? `${attendanceSummary.present} (days)`
                          : status === "Absent"
                          ? `${attendanceSummary.absent} (days)`
                          : `${attendanceSummary.late} (days)`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exams Section */}
          {/* {childExams.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">
                Exam Performance
              </h2>
              <select
                value={selectedExamId || ""}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="p-2 sm:p-3 rounded bg-gray-900 text-white w-full sm:w-1/2"
              >
                <option value="">Select Exam</option>
                {childExams.map((exam) => (
                  <option key={exam.examId} value={exam.examId}>
                    {exam.examName} — {exam.term}
                  </option>
                ))}
              </select>

              {selectedExamId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mt-2 sm:mt-4 overflow-auto">
                  {childExams
                    .find((e) => e.examId === selectedExamId)
                    .subjects.map((subj, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 sm:p-4 rounded-2xl shadow-md text-sm sm:text-base"
                      >
                        <h3 className="text-base sm:text-lg font-semibold">
                          {subj.name}
                        </h3>
                        <p>
                          <span className="font-medium text-gray-300">
                            Score:
                          </span>{" "}
                          {subj.score}
                        </p>
                        <p>
                          <span className="font-medium text-gray-300">
                            Grade:
                          </span>{" "}
                          {subj.grade || "-"}
                        </p>
                        {subj.remark && (
                          <p>
                            <span className="font-medium text-gray-300">
                              Remark:
                            </span>{" "}
                            {subj.remark}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
