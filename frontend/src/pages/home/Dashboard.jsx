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
 <main className="p-6 bg-gray-950 text-white min-h-screen">
  {/* Top Summary Cards */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {/* Only display stats here */}
    <div className="bg-gray-900 p-4 rounded-lg shadow">Students: 523</div>
    <div className="bg-gray-900 p-4 rounded-lg shadow">Teachers: 45</div>
    <div className="bg-gray-900 p-4 rounded-lg shadow">Bursars: 3</div>
    <div className="bg-gray-900 p-4 rounded-lg shadow">Outstanding Fees: Ksh 120,000</div>
  </div>

  {/* Management Sections */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Teachers */}
    <section className="bg-gray-900 p-6 rounded-lg shadow">
  <h2 className="text-xl font-bold mb-4">Manage Teachers</h2>

  <div className="flex justify-between items-center mb-4">
    <button className="bg-white text-black px-4 py-2 rounded">
      + Add Teacher
    </button>
    <Link to="/teachers" className="text-blue-400">View All</Link>
  </div>

  <table className="w-full text-left text-sm">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="py-2">Name</th>
        <th className="py-2">Subject</th>
        <th className="py-2">Email</th>
        <th className="py-2 text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-800">
        <td className="py-2">Mary Kamau</td>
        <td className="py-2">Math</td>
        <td className="py-2">mary@nexa.com</td>
        <td className="py-2 text-right">
          <button className="text-blue-400 mr-2">✏️ Edit</button>
          <button className="text-red-400">🗑 Delete</button>
        </td>
      </tr>
      {/* ...more rows */}
    </tbody>
  </table>
</section>


    {/* Students */}
    <section className="bg-gray-900 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Manage Students</h2>
      <div className="flex justify-between items-center mb-4">
        <Link to='/dashboard/createStudent' className="bg-white text-black px-4 py-2 rounded">+ Add Student</Link>
        <Link to="/students" className="text-blue-400">View All</Link>
      </div>
      {/* Small table preview (recent students) */}
    </section>

    {/* Bursars */}
<section className="bg-gray-900 p-6 rounded-lg shadow">
  <h2 className="text-xl font-bold mb-4">Manage Bursars</h2>

  <div className="flex justify-between items-center mb-4">
    <button className="bg-white text-black px-4 py-2 rounded">
      + Add Bursar
    </button>
    <Link to="/bursars" className="text-blue-400">View All</Link>
  </div>

  <table className="w-full text-left text-sm">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="py-2">Name</th>
        <th className="py-2">Email</th>
        <th className="py-2">Phone</th>
        <th className="py-2 text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-800">
        <td className="py-2">Peter Njoroge</td>
        <td className="py-2">peter@nexa.com</td>
        <td className="py-2">0712345678</td>
        <td className="py-2 text-right">
          <button className="text-blue-400 mr-2">✏️ Edit</button>
          <button className="text-red-400">🗑 Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</section>

  </div>

  {/* Recent Activity */}
  <section className="mt-8 bg-gray-900 p-6 rounded-lg shadow">
    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
    <ul className="space-y-2 text-sm">
      <li>✅ New student John Doe registered</li>
      <li>💰 Payment of Ksh 15,000 recorded</li>
      <li>👩‍🏫 Teacher Mary added</li>
    </ul>
  </section>
</main>


  );
};

export default Dashboard;


