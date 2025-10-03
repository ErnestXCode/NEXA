import React, { useState } from "react";
import { useSelector } from "react-redux";
import { store } from "../../redux/store";
import { logOut, selectCurrentUser } from "../../redux/slices/authSlice";
import api from "../../api/axios";
import { useNavigate, NavLink } from "react-router-dom";
import useUnreadMessages from "../../hooks/useUnreadMessages"; // ✅ new
import useUnreadProofs from "../../hooks/useUnreadProofs";

const Navigation = () => {
  const [sidenav, setSidenav] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { unreadCount, resetUnread } = useUnreadMessages(currentUser);
  const { pendingCount, resetPending } = useUnreadProofs(currentUser);

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
    `relative block py-2 px-4 rounded hover:bg-gray-800 transition ${
      isActive ? "bg-gray-800" : ""
    }`;

  const role = currentUser?.role;
  const isSuperAdminOrAdmin = role === "superadmin" || role === "admin";
  const isTeacher = role === "teacher";
  const isBursar = role === "bursar";
  const isClassTeacher = currentUser?.isClassTeacher;

  return (
    <nav className="p-4 flex justify-between items-center bg-gray-900 text-white sticky top-0 z-20">
      <h1 className="font-semibold text-lg">
        <NavLink end to="/dashboard">
          NEXA | Hello, {currentUser?.name}
        </NavLink>
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
              className="bg-gray-100 text-black px-4 py-2 rounded hover:bg-black hover:text-white cursor-pointer transition"
            >
              Logout
            </button>
            <button
              onClick={handleCloseSidenav}
              className="text-white font-bold text-lg cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-5 text-white">
            {/* 🌍 Global (for all users) */}
            <div>
              <h3 className="text-gray-400 uppercase text-xs mb-2">General</h3>
              <NavLink
                end
                onClick={handleCloseSidenav}
                to="/dashboard"
                className={navLinkClasses}
              >
                Dashboard
              </NavLink>

              <NavLink
                end
                onClick={() => {
                  handleCloseSidenav();
                  resetUnread();
                }}
                to="/dashboard/communication"
                className={navLinkClasses}
              >
                Messages
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-600 text-white text-sm">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                end
                onClick={handleCloseSidenav}
                to="/dashboard/review"
                className={navLinkClasses}
              >
                Reviews
              </NavLink>
              <NavLink
                end
                onClick={handleCloseSidenav}
                to="/dashboard/billing"
                className={navLinkClasses}
              >
                Billing
              </NavLink>

              <NavLink
                end
                onClick={handleCloseSidenav}
                to="/feedback"
                className={navLinkClasses}
              >
                Feedback
              </NavLink>
            </div>

            {/* 👑 Admin / Superadmin */}
            {isSuperAdminOrAdmin && (
              <>
                <div>
                  <h3 className="text-gray-400 uppercase text-xs mb-2">
                    Forms
                  </h3>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/createPersonel"
                    className={navLinkClasses}
                  >
                    Add Teacher/Bursar
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/createStudent"
                    className={navLinkClasses}
                  >
                    Add Student
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/createParent"
                    className={navLinkClasses}
                  >
                    Add Parent
                  </NavLink>
                </div>

                <div>
                  <h3 className="text-gray-400 uppercase text-xs mb-2">
                    Lists
                  </h3>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/teachers"
                    className={navLinkClasses}
                  >
                    All Teachers
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/bursars"
                    className={navLinkClasses}
                  >
                    All Bursars
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/students"
                    className={navLinkClasses}
                  >
                    All Students
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/parents"
                    className={navLinkClasses}
                  >
                    All Parents
                  </NavLink>
                  {role === "superadmin" && (
                    <NavLink
                      end
                      onClick={handleCloseSidenav}
                      to="/dashboard/schools"
                      className={navLinkClasses}
                    >
                      All Schools
                    </NavLink>
                  )}
                </div>

                <div>
                  <h3 className="text-gray-400 uppercase text-xs mb-2">
                    Attendance
                  </h3>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/attendance"
                    className={navLinkClasses}
                  >
                    View Attendance
                  </NavLink>
                  {role !== "admin" && (
                    <NavLink
                      end
                      onClick={handleCloseSidenav}
                      to="/dashboard/attendance/mark"
                      className={navLinkClasses}
                    >
                      Mark Attendance
                    </NavLink>
                  )}
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/attendance/logs"
                    className={navLinkClasses}
                  >
                    Attendance Logs
                  </NavLink>
                </div>

                <div>
                  <h3 className="text-gray-400 uppercase text-xs mb-2">
                    Exams
                  </h3>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/exams"
                    className={navLinkClasses}
                  >
                    Exams
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/exams/record"
                    className={navLinkClasses}
                  >
                    Record Results
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/exams/report"
                    className={navLinkClasses}
                  >
                    Report Cards
                  </NavLink>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/exams/logs"
                    className={navLinkClasses}
                  >
                    Exam Logs
                  </NavLink>
                </div>

                <div>
                  <h3 className="text-gray-400 uppercase text-xs mb-2">Fees</h3>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/fees"
                    className={navLinkClasses}
                  >
                    Fees
                  </NavLink>
                  <NavLink
                    end
                    onClick={() => {
                      handleCloseSidenav();
                      resetPending(); // reset badge when clicked
                    }}
                    to="/dashboard/fees/add"
                    className={navLinkClasses}
                  >
                    Record Payment
                    {pendingCount > 0 && (
                      <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                  </NavLink>

                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/fees/logs"
                    className={navLinkClasses}
                  >
                    Fee Logs
                  </NavLink>
                </div>

                <div>
                  <h3 className="text-gray-400 uppercase text-xs mb-2">
                    System
                  </h3>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/settings"
                    className={navLinkClasses}
                  >
                    Settings
                  </NavLink>
                </div>
              </>
            )}

            {/* 👨‍🏫 Teacher */}
            {isTeacher && (
              <>
                <div>
                  <h3 className="text-gray-400 uppercase text-xs mb-2">
                    Exams
                  </h3>
                  <NavLink
                    end
                    onClick={handleCloseSidenav}
                    to="/dashboard/exams/record"
                    className={navLinkClasses}
                  >
                    Record Results
                  </NavLink>
                </div>
                {isClassTeacher && (
                  <div>
                    <h3 className="text-gray-400 uppercase text-xs mb-2">
                      Attendance
                    </h3>
                    <NavLink
                      end
                      onClick={handleCloseSidenav}
                      to="/dashboard/attendance"
                      className={navLinkClasses}
                    >
                      View Attendance
                    </NavLink>
                    <NavLink
                      end
                      onClick={handleCloseSidenav}
                      to="/dashboard/attendance/mark"
                      className={navLinkClasses}
                    >
                      Mark Attendance
                    </NavLink>
                  </div>
                )}
              </>
            )}

            {/* 💰 Bursar */}
            {isBursar && !isSuperAdminOrAdmin && (
              <div>
                <h3 className="text-gray-400 uppercase text-xs mb-2">Fees</h3>
                <NavLink
                  end
                  onClick={handleCloseSidenav}
                  to="/dashboard/fees"
                  className={navLinkClasses}
                >
                  Fees
                </NavLink>
                <NavLink
                  end
                  onClick={handleCloseSidenav}
                  to="/dashboard/fees/add"
                  className={navLinkClasses}
                >
                  Record Payment
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
