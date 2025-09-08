import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/personel/parent/dashboard");
      setChildren(res.data.children);
      if (res.data.children.length > 0) setSelectedChild(res.data.children[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gray-950 text-gray-200">
      {/* Child selector if multiple */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {children.map((child) => (
            <button
              key={child._id}
              onClick={() => setSelectedChild(child)}
              className={`px-5 py-2 rounded-full font-medium transition-colors duration-200 ${
                selectedChild?._id === child._id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-gray-300">Name:</span>{" "}
                {selectedChild.firstName} {selectedChild.lastName}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Admission #:</span>{" "}
                {selectedChild.admissionNumber}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Class:</span>{" "}
                {selectedChild.classLevel}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Stream:</span>{" "}
                {selectedChild.stream || "-"}
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-gray-300">Guardian:</span>{" "}
                {selectedChild.guardianName}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Phone:</span>{" "}
                {selectedChild.guardianPhone}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Email:</span>{" "}
                {selectedChild.guardianEmail || "-"}
              </p>
              <p>
                <span className="font-semibold text-gray-300">Relationship:</span>{" "}
                {selectedChild.relationship || "-"}
              </p>
            </div>
          </div>

          {/* Fees Summary */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              Fees Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-950 p-4 rounded-xl shadow text-center">
                <p className="text-gray-400 text-sm">Total Paid</p>
                <p className="text-green-400 font-bold text-lg">
                  KES {selectedChild.feesSummary?.paid || 0}
                </p>
              </div>
              <div className="bg-gray-950 p-4 rounded-xl shadow text-center">
                <p className="text-gray-400 text-sm">Adjustments</p>
                <p className="text-yellow-400 font-bold text-lg">
                  KES {selectedChild.feesSummary?.adjustments || 0}
                </p>
              </div>
              <div className="bg-gray-950 p-4 rounded-xl shadow text-center">
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-blue-400 font-bold text-lg">
                  KES {selectedChild.feesSummary?.total || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Exam Results */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              Exam Results
            </h2>
            {selectedChild.examResults?.length > 0 ? (
              <div className="space-y-4">
                {selectedChild.examResults.map((exam, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-950 p-4 rounded-2xl shadow grid grid-cols-1 gap-4"
                  >
                    <p className="font-semibold text-blue-400 text-lg">
                      {exam.term} - {exam.exam}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {exam.subjects.map((subj, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-gray-900 p-3 rounded-xl text-center shadow-sm"
                        >
                          <p className="font-medium text-gray-300">{subj.name}</p>
                          <p className="text-gray-100">{subj.score}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap justify-between text-gray-200 mt-2">
                      <p>
                        <span className="font-semibold text-gray-300">Total:</span>{" "}
                        {exam.total}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-300">Average:</span>{" "}
                        {exam.average}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-300">Grade:</span>{" "}
                        {exam.grade}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No exam results available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
