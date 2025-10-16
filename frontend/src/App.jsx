import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import { useSelector } from "react-redux";

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
import ResetPassword from "./pages/auth/ResetPassword";
import Analytics from "./components/analytics/Analytics";
import Feedback from "./pages/feedback/Feedback";
import InstallPrompt from "./install/InstallPrompt";
import LoadingWithFacts from "./components/layout/LoadingWithFacts";
import Billing from "./pages/home/Billing";
import SetupWizard from "./components/wizard/SetUpWizard";
import ReviewPage from "./pages/review/ReviewPage";

// ---------------- Lazy imports for role-specific modules ----------------
const FeesPage = React.lazy(() => import("./pages/fees/FeesPage"));
const AddFeePage = React.lazy(() => import("./pages/fees/AddFeePage"));
const FeeAuditPage = React.lazy(() => import("./pages/fees/FeeAuditPage"));
const CreditAuditPage = React.lazy(() => import("./pages/fees/CreditAuditPage"));
const DebtorHistoryPage = React.lazy(() => import("./pages/fees/DebtorHistoryPage"));

const AttendanceDashboard = React.lazy(() => import("./pages/attendance/AttendanceDashboard"));
const AttendancePage = React.lazy(() => import("./pages/attendance/AttendancePage"));
const AttendanceLogsPage = React.lazy(() => import("./pages/attendance/AttendanceLogsPage"));

const SchoolSettings = React.lazy(() => import("./pages/settings/SchoolSettings"));

const PersonelForm = React.lazy(() => import("./pages/actions/PersonelForm"));
const StudentForm = React.lazy(() => import("./pages/actions/StudentForm"));
const ParentForm = React.lazy(() => import("./pages/actions/ParentForm"));

const AllStudents = React.lazy(() => import("./pages/actions/AllStudents"));
const StudentEditPage = React.lazy(() => import("./pages/actions/StudentEditPage"));

const AllTeachers = React.lazy(() => import("./pages/actions/AllTeachers"));
const AllBursars = React.lazy(() => import("./pages/actions/AllBursars"));
const AllParents = React.lazy(() => import("./pages/actions/AllParents"));

const PersonnelEditPage = React.lazy(() => import("./pages/actions/PersonnelEditPage"));
const ParentEditPage = React.lazy(() => import("./pages/actions/ParentEditPage"));

const AllSchools = React.lazy(() => import("./pages/actions/AllSchools"));
const SchoolEditPage = React.lazy(() => import("./pages/actions/SchoolEditPage"));

const ExamsPage = React.lazy(() => import("./pages/exams/ExamsPage"));
const RecordResultsPage = React.lazy(() => import("./pages/exams/RecordResultsPage"));
const ReportCardsPage = React.lazy(() => import("./pages/exams/ReportCardsPage"));
const ResultsAuditPage = React.lazy(() => import("./pages/exams/ResultsAuditPage"));

// ---------------- Role-based preloading ----------------
const preloadTeacherModules = () => {
  import("./pages/attendance/AttendanceDashboard");
  import("./pages/attendance/AttendancePage");
  import("./pages/attendance/AttendanceLogsPage");
  import("./pages/exams/ExamsPage");
  import("./pages/exams/RecordResultsPage");
  import("./pages/exams/ReportCardsPage");
  import("./pages/exams/ResultsAuditPage");
};

const preloadBursarModules = () => {
  import("./pages/fees/FeesPage");
  import("./pages/fees/AddFeePage");
  import("./pages/fees/FeeAuditPage");
  import("./pages/fees/CreditAuditPage");
  import("./pages/fees/DebtorHistoryPage");
};

const preloadAdminModules = () => {
  preloadTeacherModules();
  preloadBursarModules();
  import("./pages/settings/SchoolSettings");
  import("./pages/actions/PersonelForm");
  import("./pages/actions/StudentForm");
  import("./pages/actions/ParentForm");
  import("./pages/actions/AllStudents");
  import("./pages/actions/StudentEditPage");
  import("./pages/actions/AllTeachers");
  import("./pages/actions/AllBursars");
  import("./pages/actions/AllParents");
  import("./pages/actions/PersonnelEditPage");
  import("./pages/actions/ParentEditPage");
};

const preloadSuperAdminModules = () => {
  preloadAdminModules();
  import("./pages/actions/AllSchools");
  import("./pages/actions/SchoolEditPage");
};

// ---------------- Home redirect ----------------
const HomeRedirect = () => {
  const { accessToken } = useSelector((state) => state.auth);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ping`).catch(() => {});
  }, []);
  if (accessToken === undefined) return <LoadingWithFacts />;
  return accessToken ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  const { user, accessToken } = useSelector((state) => state.auth);
  const role = user?.role;

  // Preload role-relevant modules on app load
  useEffect(() => {
    if (!role) return;
    if (role === "teacher") preloadTeacherModules();
    if (role === "bursar") preloadBursarModules();
    if (role === "admin") preloadAdminModules();
    if (role === "superadmin") preloadSuperAdminModules();
  }, [role]);

  

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
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="setup" element={<SetupWizard />} />
          <Route path="communication" element={<Communication />} />
          <Route path="review" element={<ReviewPage />} />

          {/* Protected routes */}
          <Route element={<PersistLogin />}>
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/dashboard">
              <Route
                path="billing"
                element={
                  <Suspense fallback={<LoadingWithFacts />}>
                    <Billing />
                  </Suspense>
                }
              />
              <Route element={<ProtectedBillingRoute />}>
                <Route index element={<Dashboard />} />

                {/* ---------------- Teacher routes ---------------- */}
                {["teacher", "admin", "superadmin"].includes(role) && (
                  <>
                    <Route
                      path="attendance"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AttendanceDashboard />
                        </Suspense>
                      }
                    />
                    <Route
                      path="attendance/mark"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AttendancePage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="attendance/logs"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AttendanceLogsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="exams"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <ExamsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="exams/record"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <RecordResultsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="exams/report"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <ReportCardsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="exams/logs"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <ResultsAuditPage />
                        </Suspense>
                      }
                    />
                  </>
                )}

                {/* ---------------- Bursar routes ---------------- */}
                {["bursar", "admin", "superadmin"].includes(role) && (
                  <>
                    <Route
                      path="fees"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <FeesPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="fees/add"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AddFeePage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="fees/logs"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <FeeAuditPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="fees/credit"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <CreditAuditPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="debtors/:studentId"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <DebtorHistoryPage />
                        </Suspense>
                      }
                    />
                  </>
                )}

                {/* ---------------- Admin/Superadmin routes ---------------- */}
                {["admin", "superadmin"].includes(role) && (
                  <>
                    <Route
                      path="settings"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <SchoolSettings />
                        </Suspense>
                      }
                    />
                    <Route
                      path="createPersonel"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <PersonelForm />
                        </Suspense>
                      }
                    />
                    <Route
                      path="createStudent"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <StudentForm />
                        </Suspense>
                      }
                    />
                    <Route
                      path="createParent"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <ParentForm />
                        </Suspense>
                      }
                    />
                    <Route
                      path="students"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AllStudents />
                        </Suspense>
                      }
                    />
                    <Route
                      path="students/edit/:id"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <StudentEditPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="teachers"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AllTeachers />
                        </Suspense>
                      }
                    />
                    <Route
                      path="bursars"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AllBursars />
                        </Suspense>
                      }
                    />
                    <Route
                      path="parents"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AllParents />
                        </Suspense>
                      }
                    />
                    <Route
                      path="personnel/edit/:id"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <PersonnelEditPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="personnel/edit-parent/:id"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <ParentEditPage />
                        </Suspense>
                      }
                    />
                  </>
                )}

                {/* ---------------- Superadmin-only routes ---------------- */}
                {role === "superadmin" && (
                  <>
                    <Route
                      path="schools"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <AllSchools />
                        </Suspense>
                      }
                    />
                    <Route
                      path="schools/edit-school/:id"
                      element={
                        <Suspense fallback={<LoadingWithFacts />}>
                          <SchoolEditPage />
                        </Suspense>
                      }
                    />
                  </>
                )}
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
