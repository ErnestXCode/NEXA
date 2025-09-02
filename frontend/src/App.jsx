import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import Features from "./pages/home/Features";
import Contact from "./pages/home/Contact";
import Pricing from "./pages/home/Pricing";
import Fees from "./pages/fees/Fees";
import Exams from "./pages/exams/Exams";
import Attendance from "./pages/attendance/Attendance";
import Communication from "./pages/communication/Communication";
import Settings from "./pages/settings/Settings";
import Dashboard from "./pages/home/Dashboard";
import PersistLogin from "./pages/auth/PersistLogin";
import PersonelForm from "./pages/actions/PersonelForm";
import StudentForm from "./pages/actions/StudentForm";
import AllTeachers from "./pages/actions/AllTeachers";
import AllBursars from "./pages/actions/AllBursars";
import AllStudents from "./pages/actions/AllStudents";
import StudentAttendanceForm from "./pages/attendance/StudentAttendanceForm";
import SendMessageForm from "./pages/communication/SendMessageForm";
import ExamForm from "./pages/exams/ExamForm";
import FeePaymentForm from "./pages/fees/FeePaymentForm";
import RecordResult from "./pages/exams/RecordResult";
import StudentEditPage from "./pages/actions/StudentEditPage";
import PersonnelEditPage from "./pages/actions/PersonnelEditPage";
import FeesModule from "./pages/fees/FeesModule";
import SetupTermFees from "./pages/fees/SetupTermFees";
import StudentFeeDetail from "./pages/fees/StudentFeeDetail";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import ReportCard from "./pages/exams/ReportCard";
import ParentForm from "./pages/actions/ParentForm";
import SetupWizard from "./components/wizard/SetUpWizard";
import Navigation from "./components/layout/Navigation";

function App() {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <BrowserRouter>
        <Navigation />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<PersistLogin />}>
            <Route path="/dashboard">
              <Route index element={<Dashboard />} />
              <Route path="fees" element={<FeesModule />} />

              <Route path="exams" element={<Exams />} />
              <Route path="attendance/hist" element={<Attendance />} />
              <Route path="attendance" element={<AttendanceDashboard />} />
              <Route path="communication" element={<Communication />} />
              <Route path="settings" element={<Settings />} />

              {/* Forms */}
              <Route path="createPersonel" element={<PersonelForm />} />
              <Route path="createStudent" element={<StudentForm />} />
              <Route path="createParent" element={<ParentForm />} />

              {/* Lists */}
              <Route path="students" element={<AllStudents />} />
              <Route path="setup" element={<SetupWizard />} />
              <Route path="students/edit/:id" element={<StudentEditPage />} />
              <Route path="teachers" element={<AllTeachers />} />
              <Route path="bursars" element={<AllBursars />} />
              <Route path="personnel/edit/:id" element={<PersonnelEditPage />} />

              <Route
                path="attendance/mark"
                element={<StudentAttendanceForm />}
              />
              <Route path="communication/send" element={<SendMessageForm />} />
              <Route path="exams/create" element={<ExamForm />} />
              <Route path="fees/record" element={<FeePaymentForm />} />
              <Route path="fees/term" element={<SetupTermFees />} />
              <Route path="fees/detail" element={<StudentFeeDetail />} />

              <Route path="exams/record" element={<RecordResult />} />
              <Route path="exams/report" element={<ReportCard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
