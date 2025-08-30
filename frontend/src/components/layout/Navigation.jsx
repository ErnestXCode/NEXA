import React, { useState } from "react";
import { useSelector } from "react-redux";
import { store } from "../../redux/store";
import { logOut, selectCurrentUser } from "../../redux/slices/authSlice";
import api from "../../api/axios";
import { useNavigate, NavLink } from "react-router-dom";

const Navigation = () => {
  const [sidenav, setSidenav] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      store.dispatch(logOut());
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCloseSidenav = () => setSidenav(false);

  const navLinkClasses = ({ isActive }) =>
    `block py-2 px-4 rounded hover:bg-gray-800 transition ${
      isActive ? "bg-gray-800" : ""
    }`;

  return (
    <nav className="p-4 flex justify-between items-center bg-gray-900 text-white">
      <h1 className="font-semibold text-lg">
        <NavLink to="/dashboard">NEXA | Hello, {currentUser?.name}</NavLink>
      </h1>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center font-semibold">
          {currentUser?.name[0]}
        </div>
        <button
          onClick={() => setSidenav(true)}
          className="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
        >
          Menu
        </button>
      </div>

      {sidenav && (
        <div className="fixed top-0 right-0 h-full w-72 bg-gray-950 shadow-lg p-5 z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-black px-4 py-2 rounded hover:bg-black hover:text-white transition"
            >
              Logout
            </button>
            <button
              onClick={handleCloseSidenav}
              className="text-white font-bold text-lg"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-3 text-white">
            {/* Dashboard */}
            <NavLink onClick={handleCloseSidenav} to="/dashboard" className={navLinkClasses}>
              Dashboard
            </NavLink>

            {/* Forms */}
            <div className="mt-4">
              <h3 className="text-gray-400 uppercase text-xs mb-2">Forms</h3>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/createPersonel" className={navLinkClasses}>
                Add Teacher/Bursar
              </NavLink>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/createStudent" className={navLinkClasses}>
                Add Student
              </NavLink>
            </div>

            {/* Lists */}
            <div className="mt-4">
              <h3 className="text-gray-400 uppercase text-xs mb-2">Lists</h3>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/teachers" className={navLinkClasses}>
                All Teachers
              </NavLink>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/bursars" className={navLinkClasses}>
                All Bursars
              </NavLink>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/students" className={navLinkClasses}>
                All Students
              </NavLink>
            </div>

            {/* Attendance */}
            <div className="mt-4">
              <h3 className="text-gray-400 uppercase text-xs mb-2">Attendance</h3>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/attendance" className={navLinkClasses}>
                View Attendance
              </NavLink>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/attendance/mark" className={navLinkClasses}>
                Mark Attendance
              </NavLink>
            </div>

            {/* Communication */}
            <div className="mt-4">
              <h3 className="text-gray-400 uppercase text-xs mb-2">Communication</h3>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/communication" className={navLinkClasses}>
                Messages
              </NavLink>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/communication/send" className={navLinkClasses}>
                Send Message
              </NavLink>
            </div>

            {/* Exams */}
            <div className="mt-4">
              <h3 className="text-gray-400 uppercase text-xs mb-2">Exams</h3>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/exams" className={navLinkClasses}>
                Exams
              </NavLink>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/exams/create" className={navLinkClasses}>
                Create Exam
              </NavLink>
            </div>

            {/* Fees */}
            <div className="mt-4">
              <h3 className="text-gray-400 uppercase text-xs mb-2">Fees</h3>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/fees" className={navLinkClasses}>
                Fees
              </NavLink>
              <NavLink onClick={handleCloseSidenav} to="/dashboard/fees/record" className={navLinkClasses}>
                Record Payment
              </NavLink>
            </div>

            {/* Settings */}
            <NavLink onClick={handleCloseSidenav} to="/dashboard/settings" className={`${navLinkClasses} mt-4`}>
              Settings
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
