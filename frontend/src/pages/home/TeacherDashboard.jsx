import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { NavLink } from "react-router-dom";

const TeacherDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <main className="flex flex-col gap-6 max-w-md mx-auto">
        {/* Messages */}
        <NavLink
          to="/dashboard/communication"
          className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 shadow-lg rounded-xl p-6 flex flex-col items-start transition transform hover:scale-105 hover:shadow-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 duration-300"
        >
          <h2 className="text-white text-2xl font-bold mb-2">Messages</h2>
          <p className="text-gray-200 text-sm">View and send messages</p>
        </NavLink>

        {/* Mark Attendance */}
        {currentUser.isClassTeacher && (
          <NavLink
            to="/dashboard/attendance/mark"
            className="bg-gradient-to-r from-green-700 via-lime-600 to-emerald-500 shadow-lg rounded-xl p-6 flex flex-col items-start transition transform hover:scale-105 hover:shadow-2xl hover:from-green-600 hover:via-lime-500 hover:to-emerald-400 duration-300"
          >
            <h2 className="text-white text-2xl font-bold mb-2">
              Mark Attendance
            </h2>
            <p className="text-gray-200 text-sm">Record student attendance</p>
          </NavLink>
        )}

        {/* View Attendance */}
        <NavLink
          to="/dashboard/attendance"
          className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 shadow-lg rounded-xl p-6 flex flex-col items-start transition transform hover:scale-105 hover:shadow-2xl hover:from-blue-600 hover:via-cyan-500 hover:to-sky-400 duration-300"
        >
          <h2 className="text-white text-2xl font-bold mb-2">View Attendance</h2>
          <p className="text-gray-200 text-sm">Check attendance records</p>
        </NavLink>

        {/* Record Results */}
        <NavLink
          to="/dashboard/exams/record"
          className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 shadow-lg rounded-xl p-6 flex flex-col items-start transition transform hover:scale-105 hover:shadow-2xl hover:from-yellow-500 hover:via-orange-400 hover:to-red-400 duration-300"
        >
          <h2 className="text-white text-2xl font-bold mb-2">Record Results</h2>
          <p className="text-gray-200 text-sm">Enter exam scores</p>
        </NavLink>
      </main>
    </div>
  );
};

export default TeacherDashboard;
