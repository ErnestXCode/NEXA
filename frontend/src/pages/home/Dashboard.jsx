import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useSelector } from "react-redux";


const registerObj = {
  name: "",
  email: "",
  password: "",
  confirmPass: "",
};



const Dashboard = () => {
  const currentUser = useSelector(selectCurrentUser)
  return (
    <main className="p-6">
      {/* Greeting */}
      <h1 className="text-2xl font-bold mb-6">Welcome back, Admin {currentUser.name}👋</h1>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">Students</h2>
          <p className="text-3xl font-bold">1,250</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">Teachers</h2>
          <p className="text-3xl font-bold">52</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">Fees Collected</h2>
          <p className="text-3xl font-bold">$45,300</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">Upcoming Exams</h2>
          <p className="text-3xl font-bold">3</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
        <div className="flex gap-4">
          <Link to='/dashboard/createPersonel' className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Personel
          </Link>
          <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-green-700">
            Register Student
          </button>
          <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-purple-700">
            Send Notice
          </button>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-bold mb-3">Recent Activity</h2>
        <ul className="bg-gray-900 p-4 rounded-xl space-y-2">
          <li>✅ 5 students registered today</li>
          <li>📚 Exam timetable updated</li>
          <li>💰 Fees payment received from 3 students</li>
        </ul>
      </section>
    </main>
  );
};

export default Dashboard;


