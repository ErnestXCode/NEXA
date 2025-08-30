import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
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

function App() {
  return (
    <div className="bg-black text-white h-screen">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (wrapped in PersistLogin) */}
          <Route element={<PersistLogin />}>
            <Route path="/dashboard" >
            <Route index element={<Dashboard />} />
            <Route path="fees" element={<Fees />} />
            <Route path="exams" element={<Exams />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="communication" element={<Communication />} />
            <Route path="settings" element={<Settings />} />
            <Route path="createPersonel" element={<PersonelForm />} />
            <Route path="createStudent" element={<StudentForm />} />
            <Route path="students" element={<AllStudents />} />
            <Route path="teachers" element={<AllTeachers />} />
            <Route path="bursars" element={<AllBursars />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
