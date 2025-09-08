import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { NavLink } from "react-router-dom";

const TeacherDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <main className="flex flex-col gap-4 max-w-md mx-auto">
        {/* Messages */}
        <NavLink
          to="/dashboard/communication"
          className="bg-gray-900 hover:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col items-start transition transform hover:scale-105"
        >
          <h2 className="text-white text-xl font-semibold mb-2">Messages</h2>
          <p className="text-gray-400 text-sm">View and send messages</p>
        </NavLink>

        {/* Mark Attendance */}
        <NavLink
          to="/dashboard/attendance/mark"
          className="bg-gray-900 hover:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col items-start transition transform hover:scale-105"
        >
          <h2 className="text-white text-xl font-semibold mb-2">Mark Attendance</h2>
          <p className="text-gray-400 text-sm">Record student attendance</p>
        </NavLink>

        {/* Record Results */}
        <NavLink
          to="/dashboard/exams/record"
          className="bg-gray-900 hover:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col items-start transition transform hover:scale-105"
        >
          <h2 className="text-white text-xl font-semibold mb-2">Record Results</h2>
          <p className="text-gray-400 text-sm">Enter exam scores</p>
        </NavLink>
      </main>
    </div>
  );
};

export default TeacherDashboard;
