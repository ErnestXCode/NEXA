import React from "react";
import { NavLink, Link } from "react-router-dom";

const Features = () => {
  return (
    <> 
      {/* Navbar (same as Home) */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-950 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Nexa</h1>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 text-gray-400">
          <NavLink to="/" className="hover:text-white transition-colors">
            Home
          </NavLink>
          <NavLink to="/features" className="hover:text-white transition-colors">
            Features
          </NavLink>
          <NavLink to="/pricing" className="hover:text-white transition-colors">
            Pricing
          </NavLink>
          <NavLink to="/contact" className="hover:text-white transition-colors">
            Contact
          </NavLink>
        </ul>

        {/* Sign Up Button */}
        <Link
          to="/register"
          className="px-5 py-2 bg-white font-semibold text-black rounded-xl hover:bg-gray-200 transition-colors"
        >
          Sign Up
        </Link>
      </nav>

      <main className="min-h-screen bg-gray-950 text-gray-100">

        {/* Header */}
        <section className="py-24 text-center bg-gradient-to-b from-gray-950 to-gray-900 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Features
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Nexa is built to empower schools with powerful, intuitive, and secure tools.
          </p>

          {/* Mobile Links Row */}
          <div className="flex flex-row gap-6 mt-8 md:hidden justify-center">
            <NavLink to="/" className="text-gray-300 hover:text-white text-sm">
              Home
            </NavLink>
            <NavLink to="/features" className="text-gray-300 hover:text-white text-sm">
              Features
            </NavLink>
            <NavLink to="/pricing" className="text-gray-300 hover:text-white text-sm">
              Pricing
            </NavLink>
            <NavLink to="/contact" className="text-gray-300 hover:text-white text-sm">
              Contact
            </NavLink>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
          {[
            { title: "Student Management", desc: "Easily manage student data, from registration to graduation, all in one place." },
            { title: "Exam & Reports", desc: "Record exam results, generate report cards, and track student progress effortlessly." },
            { title: "Attendance Tracking", desc: "Mark daily attendance and generate insights on student presence and trends." },
            { title: "Fees & Billing", desc: "Simplify fee collection with automated statements and real-time tracking." },
            { title: "Communication", desc: "Engage parents, teachers, and students with seamless messaging and notifications." },
            { title: "Secure & Reliable", desc: "Enterprise-grade security to protect sensitive data and ensure uptime." },
          ].map((f, idx) => (
            <div
              key={idx}
              className="p-8 bg-gray-900 rounded-2xl shadow border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-full mb-6"></div>
              <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer (same as Home) */}
      <footer className="py-8 bg-gray-900 text-gray-500 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Features;
