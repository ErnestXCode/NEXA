import React from "react";
import { NavLink, Link } from "react-router-dom";

const Features = () => {
  return (
    <> 
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-900">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Nexa</h1>
        </div>
        <ul className="hidden md:flex gap-6 text-gray-300">
          <NavLink to="/" className="hover:text-white">Home</NavLink>
          <NavLink to="/features" className="hover:text-white">Features</NavLink>
          <NavLink to="/pricing" className="hover:text-white">Pricing</NavLink>
          <NavLink to="/contact" className="hover:text-white">Contact</NavLink>
        </ul>
        <Link
          to="/register"
          className="px-4 py-2 bg-white font-semibold text-black rounded-lg hover:bg-gray-200"
        >
          Sign Up
        </Link>
      </nav>

      <main className="min-h-screen bg-black text-gray-100">

        {/* Header */}
        <section className="py-20 text-center bg-gray-900 px-4">
          <h1 className="text-5xl font-bold text-white mb-4">Features</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Nexa is built to empower schools with powerful, intuitive, and secure tools.
          </p>

          {/* Mobile Links Row */}
          <div className="flex flex-row gap-4 mt-6 md:hidden justify-center px-4">
            <NavLink to="/" className="text-white hover:text-gray-300 text-sm px-2">Home</NavLink>
            <NavLink to="/features" className="text-white hover:text-gray-300 text-sm px-2">Features</NavLink>
            <NavLink to="/pricing" className="text-white hover:text-gray-300 text-sm px-2">Pricing</NavLink>
            <NavLink to="/contact" className="text-white hover:text-gray-300 text-sm px-2">Contact</NavLink>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
          {[
            { title: "Student Management", desc: "Easily manage student data, from registration to graduation, all in one place." },
            { title: "Exam & Reports", desc: "Record exam results, generate report cards, and track student progress effortlessly." },
            { title: "Attendance Tracking", desc: "Mark daily attendance and generate insights on student presence and trends." },
            { title: "Fees & Billing", desc: "Simplify fee collection with automated statements and real-time tracking." },
            { title: "Communication", desc: "Engage parents, teachers, and students with seamless messaging and notifications." },
            { title: "Secure & Reliable", desc: "Enterprise-grade security to protect sensitive data and ensure uptime." },
          ].map((f, idx) => (
            <div key={idx} className="p-6 bg-gray-900 rounded-xl shadow border border-gray-800">
              <div className="w-16 h-16 bg-gray-700 rounded-full mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
};

export default Features;
