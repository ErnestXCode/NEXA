// src/pages/fees/FeesModule.jsx
import React, { useState } from "react";
import Fees from "./Fees";
import FeePaymentForm from "./FeePaymentForm";
import SetupTermFees from "./SetupTermFees";
import StudentFeeDetail from "./StudentFeeDetail";

const FeesModule = () => {
  const [view, setView] = useState("dashboard"); // dashboard, payment, setup, detail
  const [selectedStudent, setSelectedStudent] = useState(null);

  const navigateToDetail = (studentId) => {
    setSelectedStudent(studentId);
    setView("detail");
  };

  return (
    <div>
      {view === "dashboard" && (
        <Fees
          onNavigate={setView}
          onSelectStudent={navigateToDetail}
        />
      )}
      {view === "payment" && (
        <FeePaymentForm onBack={() => setView("dashboard")} />
      )}
      {view === "setup" && (
        <SetupTermFees onBack={() => setView("dashboard")} />
      )}
      {view === "detail" && selectedStudent && (
        <StudentFeeDetail
          studentId={selectedStudent}
          onBack={() => setView("dashboard")}
        />
      )}
    </div>
  );
};

export default FeesModule;
