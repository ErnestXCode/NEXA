// src/pages/dashboard/parent/ParentDashboard.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../../api/axios";
import useUnreadMessages from "../../../hooks/useUnreadMessages";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [childExams, setChildExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [feeBalances, setFeeBalances] = useState(null);

  // ✅ hook for unread badge
  const { unreadCount } = useUnreadMessages();

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

  const fetchFeeBalances = async (studentId) => {
    try {
      const res = await api.get(
        `/fees/outstanding/${studentId}?academicYear=2025/2026`
      );
      setFeeBalances(res.data.balances || {});
    } catch (err) {
      console.error("Error fetching fee balances:", err);
      setFeeBalances(null);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceSummary(selectedChild._id);
      fetchChildExams(selectedChild._id);
      fetchFeeBalances(selectedChild._id);
    } else {
      setAttendanceSummary(null);
      setChildExams([]);
      setFeeBalances(null);
      setSelectedExamId(null);
    }
  }, [selectedChild]);

  return (
    <div className="p-4 sm:p-6 space-y-8 min-h-screen bg-gray-950 text-gray-200">
      {/* 🔹 Messages NavLink */}
      <NavLink
        to="/dashboard/communication"
        className="relative block bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 shadow-md rounded-2xl p-6 transition transform hover:scale-105 hover:shadow-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 duration-300"
      >
        <h2 className="text-white text-2xl font-bold mb-2">Messages</h2>
        <p className="text-gray-200 text-sm">Check school communications</p>

        {unreadCount > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-gray-950 text-white text-xs font-bold px-2 py-0.5 rounded-full ring-2 ring-purple-400 shadow-lg"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </NavLink>

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
            </div>
          </div>


          {/* ✅ New Outstanding Fees Block (from /fees/outstanding) */}
          {feeBalances && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold mb-4 text-white">
                Outstanding Balances – <span className="text-gray-400 text-sm">
                  
                  {selectedChild.firstName}{" "}
                {selectedChild.lastName}
                  </span>
              </h2>
              <ul className="space-y-2 text-sm">
                {["Term 1", "Term 2", "Term 3"].map((term) => (
                  <li
                    key={term}
                    className="flex justify-between border-b border-gray-800 pb-1"
                  >
                    <span>{term}</span>
                    <span
                      className={`font-semibold ${
                        (feeBalances[term] ?? 0) === 0
                          ? "text-green-400"
                          : feeBalances[term] > 0
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      KSh {feeBalances[term] ?? 0}
                    </span>
                  </li>
                ))}
                {feeBalances.rollover && (
                  <li className="flex justify-between pt-2 text-yellow-300">
                    <span>
                      Rollover to {feeBalances.rollover.academicYear}
                    </span>
                    <span>KSh {feeBalances.rollover.amount}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

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
