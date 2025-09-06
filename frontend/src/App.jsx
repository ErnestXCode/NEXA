import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import Features from "./pages/home/Features";
import Contact from "./pages/home/Contact";
import Pricing from "./pages/home/Pricing";
import Communication from "./pages/communication/Communication";
import Settings from "./pages/settings/Settings";
import Dashboard from "./pages/home/Dashboard";
import PersistLogin from "./pages/auth/PersistLogin";
import PersonelForm from "./pages/actions/PersonelForm";
import StudentForm from "./pages/actions/StudentForm";
import AllTeachers from "./pages/actions/AllTeachers";
import AllBursars from "./pages/actions/AllBursars";
import AllStudents from "./pages/actions/AllStudents";
import SendMessageForm from "./pages/communication/SendMessageForm";
import StudentEditPage from "./pages/actions/StudentEditPage";
import PersonnelEditPage from "./pages/actions/PersonnelEditPage";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import ParentForm from "./pages/actions/ParentForm";
import SetupWizard from "./components/wizard/SetUpWizard";
import AttendancePage from "./pages/attendance/AttendancePage";
import ExamsPage from "./pages/exams/ExamsPage";
import RecordResultsPage from "./pages/exams/RecordResultsPage";
import ReportCardPage from "./pages/exams/ReportCardPage";
import FeesPage from "./pages/fees/FeesPage";
import AddFeePage from "./pages/fees/AddFeePage";
import StudentFeesPage from "./pages/fees/StudentFeesPage";
import SendFeeStatementPage from "./pages/fees/SendFeeStatementPage";
import SetFeeExpectationPage from "./pages/fees/SetFeeExpectationPage";


import { useParams } from "react-router-dom";
import FeeHistory from "./pages/fees/FeeHistory";
import AllSchools from "./pages/actions/AllSchools";
const FeeHistoryWrapper = () => {
  const { studentId } = useParams();
  return <FeeHistory studentId={studentId} />;
};

function App() {

  
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <BrowserRouter>
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
              <Route path="fees" element={<FeesPage />} />
              <Route path="fees/add" element={<AddFeePage />} />
              <Route
                path="fees/student/:studentId"
                element={<StudentFeesPage />}
              />
              <Route
                path="fees/send-statement"
                element={<SendFeeStatementPage />}
              />
              <Route path="fees/set-expectation" element={<SetFeeExpectationPage />} />
              <Route path="fees/history/:studentId" element={<FeeHistoryWrapper />} />

              <Route path="attendance" element={<AttendanceDashboard />} />
              <Route path="attendance/mark" element={<AttendancePage />} />

              <Route path="communication" element={<Communication />} />
              <Route path="communication/send" element={<SendMessageForm />} />
              <Route path="settings" element={<Settings />} />

              <Route path="schools" element={<AllSchools />} />

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
              <Route
                path="personnel/edit/:id"
                element={<PersonnelEditPage />}
              />

              <Route path="exams" element={<ExamsPage />} />
              <Route path="exams/record" element={<RecordResultsPage />} />
              <Route path="exams/report" element={<ReportCardPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
