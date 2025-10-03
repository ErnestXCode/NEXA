import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import Features from "./pages/home/Features";
import Contact from "./pages/home/Contact";
import Pricing from "./pages/home/Pricing";
import Communication from "./pages/communication/Communication";
import Dashboard from "./pages/home/Dashboard";
import PersistLogin from "./pages/auth/PersistLogin";
import ProtectedBillingRoute from "./pages/auth/ProtectedBillingRoute";
import PersonelForm from "./pages/actions/PersonelForm";
import StudentForm from "./pages/actions/StudentForm";
import AllTeachers from "./pages/actions/AllTeachers";
import AllBursars from "./pages/actions/AllBursars";
import AllStudents from "./pages/actions/AllStudents";
import SendMessageForm from "./pages/communication/SendMessageForm";
import StudentEditPage from "./pages/actions/StudentEditPage";
import PersonnelEditPage from "./pages/actions/PersonnelEditPage";
import ParentEditPage from "./pages/actions/ParentEditPage";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import ParentForm from "./pages/actions/ParentForm";
import SetupWizard from "./components/wizard/SetUpWizard";
import AttendancePage from "./pages/attendance/AttendancePage";
import ExamsPage from "./pages/exams/ExamsPage";
import RecordResultsPage from "./pages/exams/RecordResultsPage";
import FeesPage from "./pages/fees/FeesPage";
import AddFeePage from "./pages/fees/AddFeePage";
import StudentFeesPage from "./pages/fees/StudentFeesPage";
import SendFeeStatementPage from "./pages/fees/SendFeeStatementPage";
import SetFeeExpectationPage from "./pages/fees/SetFeeExpectationPage";

import { useParams } from "react-router-dom";
import FeeHistory from "./pages/fees/FeeHistory";
import AllSchools from "./pages/actions/AllSchools";
import AllParents from "./pages/actions/AllParents";
import SchoolEditPage from "./pages/actions/SchoolEditPage";
import SchoolSettings from "./pages/settings/SchoolSettings";
import ReportCardsPage from "./pages/exams/ReportCardsPage";
import Analytics from "./components/analytics/Analytics";
import Feedback from "./pages/feedback/Feedback";
import InstallPrompt from "./install/InstallPrompt";
import { useSelector } from "react-redux";
import ReviewPage from "./pages/review/ReviewPage";
import { useEffect } from "react";
import Billing from "./pages/home/Billing";
import AttendanceLogsPage from "./pages/attendance/AttendanceLogsPage";
import ResultsAuditPage from "./pages/exams/ResultsAuditPage";
import FeeAuditPage from "./pages/fees/FeeAuditPage";

const FeeHistoryWrapper = () => {
  const { studentId } = useParams();
  return <FeeHistory studentId={studentId} />;
};

const HomeRedirect = () => {
  const { accessToken } = useSelector((state) => state.auth);

  // Wait until PersistLogin has finished loading
  if (accessToken === undefined)
    return <p className="p-6 text-gray-400">Loading...</p>; // or a spinner

  return accessToken ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  useEffect(() => {
    const handleFocus = () => {
      if ("clearAppBadge" in navigator)
        navigator.clearAppBadge().catch(() => {});
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);


  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <BrowserRouter>
        <Analytics />
        <InstallPrompt />
        <Routes>
          {/* Public routes */}
          <Route element={<PersistLogin hideNav={true} />}>
            <Route path="/" element={<HomeRedirect />} />
          </Route>
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<PersistLogin />}>
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/dashboard">
              <Route path="billing" element={<Billing />} />

              <Route element={<ProtectedBillingRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="fees" element={<FeesPage />} />
                <Route path="fees/add" element={<AddFeePage />} />
                <Route path="fees/logs" element={<FeeAuditPage />} />
                <Route
                  path="fees/student/:studentId"
                  element={<StudentFeesPage />}
                />
                <Route
                  path="fees/send-statement"
                  element={<SendFeeStatementPage />}
                />
                <Route
                  path="fees/set-expectation"
                  element={<SetFeeExpectationPage />}
                />
                <Route
                  path="fees/history/:studentId"
                  element={<FeeHistoryWrapper />}
                />

                <Route path="attendance" element={<AttendanceDashboard />} />
                <Route path="attendance/mark" element={<AttendancePage />} />
                <Route path="attendance/logs" element={<AttendanceLogsPage />} />

                <Route path="communication" element={<Communication />} />
                <Route
                  path="communication/send"
                  element={<SendMessageForm />}
                />
                <Route path="settings" element={<SchoolSettings />} />

                {/* Forms */}
                <Route path="createPersonel" element={<PersonelForm />} />
                <Route path="createStudent" element={<StudentForm />} />
                <Route path="createParent" element={<ParentForm />} />

                {/* Lists */}
                <Route path="students" element={<AllStudents />} />
                <Route path="students/edit/:id" element={<StudentEditPage />} />

                <Route path="setup" element={<SetupWizard />} />

                <Route path="teachers" element={<AllTeachers />} />
                <Route path="bursars" element={<AllBursars />} />
                <Route path="parents" element={<AllParents />} />
                <Route
                  path="personnel/edit/:id"
                  element={<PersonnelEditPage />}
                />
                <Route
                  path="personnel/edit-parent/:id"
                  element={<ParentEditPage />}
                />
                <Route path="schools" element={<AllSchools />} />
                <Route
                  path="schools/edit-school/:id"
                  element={<SchoolEditPage />}
                />

                <Route path="exams" element={<ExamsPage />} />
                <Route path="exams/record" element={<RecordResultsPage />} />
                <Route path="exams/report" element={<ReportCardsPage />} />
                <Route path="exams/logs" element={<ResultsAuditPage />} />

                <Route path="review" element={<ReviewPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
