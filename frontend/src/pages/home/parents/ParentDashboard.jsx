// src/pages/dashboard/parent/ParentDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import useUnreadMessages from "../../../hooks/useUnreadMessages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CustomSelect from "../../../components/layout/CustomSelect";
import { NavLink, useNavigate } from "react-router-dom";
import StudentFeeSummary from "../../fees/StudentFeeSummary";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [childExams, setChildExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [showAllProofs, setShowAllProofs] = useState({
    pending: false,
    confirmed: false,
    rejected: false,
  });
  const navigate = useNavigate();

  const [proof, setProof] = useState({
    amount: "",
    txnCode: "",
    method: "mpesa",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const queryClient = useQueryClient();

  const submitProof = async () => {
    if (!selectedChild) return;

    try {
      setSubmitting(true);
      setMessage(null);
      await api.post("/fees/proofs", {
        studentId: selectedChild._id,
        amount: proof.amount,
        txnCode: proof.txnCode,
        method: proof.method,
      });
      setMessage("✅ Proof submitted successfully. Awaiting confirmation.");
      setProof({ amount: "", txnCode: "", method: "mpesa" });
      queryClient.refetchQueries(["proofs", "pending"]);
    } catch (err) {
      console.error("Error submitting proof:", err);
      setMessage("❌ Failed to submit proof. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const {
    data: schoolData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["school", "me"],
    queryFn: async () => {
      const res = await api.get(`/schools/me`);
      return res.data;
    },
  });

  const [school, setSchool] = useState(null);

  useEffect(() => {
    if (schoolData) setSchool(schoolData);
  }, [schoolData]);

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

  const [myProofs, setMyProofs] = useState({
    pending: [],
    confirmed: [],
    rejected: [],
  });

  const fetchMyProofs = async () => {
    try {
      const res = await api.get("/fees/proofs/my");
      const categorized = { pending: [], confirmed: [], rejected: [] };

      res.data.forEach((p) => {
        categorized[p.status]?.push(p);
      });

      setMyProofs(categorized);
    } catch (err) {
      console.error("Error fetching my proofs:", err);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchMyProofs();
    }
  }, [selectedChild, submitting]); // refresh after new proof

  // const fetchFeeBalances = async (studentId) => {
  //   try {
  //     const res = await api.get(`/fees/outstanding/${studentId}`);
  //     setFeeBalances(res.data.balances || {});
  //   } catch (err) {
  //     console.error("Error fetching fee balances:", err);
  //     setFeeBalances(null);
  //   }
  // };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceSummary(selectedChild._id);
      fetchChildExams(selectedChild._id);
      // fetchFeeBalances(selectedChild._id);
    } else {
      setAttendanceSummary(null);
      setChildExams([]);
      // setFeeBalances(null);
      setSelectedExamId(null);
    }
  }, [selectedChild]);

  return (
    <div className="p-4 sm:p-6 space-y-8 min-h-screen bg-gray-950 text-gray-200">
      {/* 🔹 Messages NavLink */}
      <NavLink
        to="/dashboard/communication"
        className="relative block bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 shadow-md rounded-2xl p-6 transition transform hover:scale-101 hover:shadow-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 duration-300"
      >
        <h2 className="text-white text-2xl font-bold mb-2">Messages</h2>
        <p className="text-gray-200 text-sm">Check school communications</p>

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gray-950 text-white text-xs font-bold px-2 py-0.5 rounded-full ring-2 ring-purple-400 shadow-lg">
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
          {selectedChild && <StudentFeeSummary studentId={selectedChild._id} />}

          {/* Payment Options */}
          {school?.paymentOptions?.length > 0 && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-md text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Pay Fees</h2>
              <p className="text-gray-400 mb-6">
                Choose one of the school’s official payment methods:
              </p>

              <div
                className={`grid gap-4 ${
                  school.paymentOptions.length === 1
                    ? "mx-auto max-w-sm sm:max-w-md md:max-w-lg" // scales with screen
                    : "sm:grid-cols-2"
                }`}
              >
                {school.paymentOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-950 p-6 rounded-xl shadow text-left"
                  >
                    <p className="font-semibold text-blue-400 text-lg mb-2">
                      {opt.type === "mpesa_paybill" && "M-Pesa Paybill"}
                      {opt.type === "mpesa_till" && "M-Pesa Till"}
                      {opt.type === "phone" && "Phone Number"}
                      {opt.type === "bank" && "Bank Account"}
                    </p>

                    <p className="text-gray-300 text-base mb-2">
                      <span className="font-bold">{opt.account}</span>
                    </p>

                    {opt.instructions && (
                      <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                        {opt.instructions
                          .split("\n")
                          .filter((line) => line.trim() !== "")
                          .map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* My Proofs Section */}
          {/* <div className="bg-gray-900 p-6 rounded-2xl shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              My Payment Proofs
            </h2>
            {["pending", "confirmed", "rejected"].map((status) => (
              <div key={status} className="mb-4">
                <h3
                  className={`font-semibold capitalize mb-2 ${
                    status === "pending"
                      ? "text-yellow-400"
                      : status === "confirmed"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {status}
                </h3>
                {myProofs[status].length === 0 ? (
                  <p className="text-gray-400 text-sm">No {status} proofs</p>
                ) : (
                  <ul className="space-y-2">
                    {myProofs[status].map((p) => (
                      <li
                        key={p._id}
                        className="p-3 rounded bg-gray-800 border border-gray-700 flex justify-between"
                      >
                        <div>
                          <p className="text-sm text-gray-200">
                            {p.studentId?.firstName} {p.studentId?.lastName} (
                            {p.studentId?.classLevel})
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.method.toUpperCase()} – KSh {p.amount}
                          </p>
                          <p className="text-xs text-gray-500">
                            Txn: {p.txnCode}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase ${
                            p.status === "pending"
                              ? "text-yellow-400"
                              : p.status === "confirmed"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div> */}
          {/* My Proofs Section */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              My Payment Proofs
            </h2>

            {/* Track which categories are expanded */}
            {["pending", "confirmed", "rejected"].map((status) => {
              const proofs = myProofs[status] || [];
              const isExpanded = showAllProofs[status] || false;

              // Decide which proofs to show
              const proofsToShow = isExpanded ? proofs : proofs.slice(0, 2);

              return (
                <div key={status} className="mb-4">
                  <h3
                    className={`font-semibold capitalize mb-2 ${
                      status === "pending"
                        ? "text-yellow-400"
                        : status === "confirmed"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {status}
                  </h3>

                  {proofs.length === 0 ? (
                    <p className="text-gray-400 text-sm">No {status} proofs</p>
                  ) : (
                    <>
                      <ul className="space-y-2">
                        {proofsToShow.map((p) => (
                          <li
                            key={p._id}
                            className="p-3 rounded bg-gray-800 border border-gray-700 flex justify-between"
                          >
                            <div>
                              <p className="text-sm text-gray-200">
                                {p.studentId?.firstName} {p.studentId?.lastName}{" "}
                                ({p.studentId?.classLevel})
                              </p>
                              <p className="text-xs text-gray-400">
                                {p.method.toUpperCase()} – KSh {p.amount}
                              </p>
                              <p className="text-xs text-gray-500">
                                Txn: {p.txnCode}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-bold uppercase ${
                                p.status === "pending"
                                  ? "text-yellow-400"
                                  : p.status === "confirmed"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {p.status}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {proofs.length > 2 && (
                        <button
                          onClick={() =>
                            setShowAllProofs((prev) => ({
                              ...prev,
                              [status]: !prev[status],
                            }))
                          }
                          className="mt-2 px-4 py-1 rounded-full bg-gray-700 text-white text-sm font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200"
                        >
                          {isExpanded
                            ? "Show Less"
                            : `Show All (${proofs.length})`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate(`/dashboard/debtors/${selectedChild._id}`)}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
          >
            View Fee History
          </button>
          {/* Submit Payment Proof */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              Submit Payment Proof
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Transaction Code"
                value={proof.txnCode}
                onChange={(e) =>
                  setProof({ ...proof, txnCode: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              />
              <input
                type="number"
                placeholder="Amount Paid"
                value={proof.amount}
                onChange={(e) => setProof({ ...proof, amount: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              />
              <CustomSelect
                value={proof.method}
                onChange={(val) => setProof({ ...proof, method: val })}
                placeholder="Select Payment Method"
                options={[
                  { value: "mpesa", label: "M-Pesa" },
                  { value: "bank", label: "Bank" },
                  { value: "cash", label: "Cash" },
                ]}
              />

              <button
                onClick={submitProof}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Proof"}
              </button>
              {message && (
                <p className="text-sm mt-2 text-center text-gray-300">
                  {message}
                </p>
              )}
            </div>
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
                          ? `${attendanceSummary.present} day(s)`
                          : status === "Absent"
                          ? `${attendanceSummary.absent} day(s)`
                          : `${attendanceSummary.late} day(s)`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Exams Section */}
          {/* Exams Section */}
          {childExams.length > 0 && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
                Exam Results
              </h2>

              {/* Dropdown to pick exam */}
              <div className="mb-4">
                {/* <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                >
                  <option value="">Select Exam</option>
                  {childExams.map((exam) => (
                    <option key={exam.examId} value={exam.examId}>
                      {exam.examName} – {exam.term}
                    </option>
                  ))}
                </select> */}

                <CustomSelect
                  value={selectedExamId}
                  onChange={setSelectedExamId}
                  placeholder="Select Exam"
                  options={childExams.map((exam) => ({
                    value: exam.examId,
                    label: `${exam.examName} – ${exam.term}`,
                  }))}
                />
              </div>

              {/* Show chosen exam */}
              {(() => {
                const examToShow =
                  selectedExamId &&
                  childExams.find((exam) => exam.examId === selectedExamId);

                if (!examToShow) return null;

                return (
                  <div className="space-y-4">
                    {/* Exam meta */}
                    <div className="bg-gray-950 p-4 rounded-xl shadow">
                      <p className="text-gray-300 text-sm">
                        <span className="font-semibold">Exam:</span>{" "}
                        {examToShow.examName}
                      </p>
                      <p className="text-gray-300 text-sm">
                        <span className="font-semibold">Term:</span>{" "}
                        {examToShow.term}
                      </p>
                      <p className="text-gray-300 text-sm">
                        <span className="font-semibold">Date:</span>{" "}
                        {new Date(examToShow.date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Subjects table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-gray-300 border border-gray-700 rounded-lg">
                        <thead className="bg-gray-800 text-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left">Subject</th>
                            <th className="px-4 py-2 text-right">Score</th>
                            <th className="px-4 py-2 text-right">Grade</th>
                            <th className="px-4 py-2 text-right">Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examToShow.subjects.map((subj, idx) => (
                            <tr
                              key={idx}
                              className={
                                idx % 2 === 0
                                  ? "bg-gray-950/40"
                                  : "bg-gray-900/40"
                              }
                            >
                              <td className="px-4 py-2">{subj.name}</td>
                              <td className="px-4 py-2 text-right">
                                {subj.score}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {subj.grade}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {subj.remark}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-950 p-4 rounded-xl shadow flex justify-between text-sm">
                      <span>Total: {examToShow.total}</span>
                      <span>Average: {examToShow.average}</span>
                      {/* <span>Grade: {examToShow.grade}</span>
            <span>Remark: {examToShow.remark}</span> */}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
