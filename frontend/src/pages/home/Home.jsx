import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Home = () => {
  const [sidenav, setSidenav] = useState(false);
  const toggleSidebar = () => setSidenav(!sidenav);

  return (
    <>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 relative">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-white text-2xl"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold text-white">Nexa</h1>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-6 text-gray-300">
          <NavLink to="/" className="hover:text-white">Home</NavLink>
          <NavLink to="/features" className="hover:text-white">Features</NavLink>
          <NavLink to="/pricing" className="hover:text-white">Pricing</NavLink>
          <NavLink to="/contact" className="hover:text-white">Contact</NavLink>
        </ul>

        <NavLink
          to="/register"
          className="hidden md:inline-block px-4 py-2 bg-white font-semibold text-black rounded-lg hover:bg-gray-200"
        >
          Sign Up
        </NavLink>

        {/* Mobile Sidebar */}
        {sidenav && (
          <div className="fixed top-0 left-0 w-64 h-full bg-gray-900 shadow-lg z-50 flex flex-col p-6 gap-6 animate-slide-in">
            <button
              className="text-white text-2xl self-end"
              onClick={toggleSidebar}
            >
              ✕
            </button>
            <NavLink
              to="/"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Home
            </NavLink>
            <NavLink
              to="/features"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Features
            </NavLink>
            <NavLink
              to="/pricing"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Pricing
            </NavLink>
            <NavLink
              to="/contact"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Contact
            </NavLink>

            <hr className="border-gray-700" />

            {/* Sidebar Dashboard Links */}
            <NavLink
              to="/dashboard"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/fees"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Fees
            </NavLink>
            <NavLink
              to="/exams"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Exams
            </NavLink>
            <NavLink
              to="/attendance"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Attendance
            </NavLink>
            <NavLink
              to="/communication"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Communication
            </NavLink>
            <NavLink
              to="/settings"
              onClick={toggleSidebar}
              className="text-white text-lg hover:text-gray-300"
            >
              Settings
            </NavLink>

            <NavLink
              to="/register"
              onClick={toggleSidebar}
              className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-center hover:bg-gray-200"
            >
              Sign Up
            </NavLink>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 bg-black px-4">
        <h1 className="text-5xl font-bold mb-4 text-white">Welcome to Nexa</h1>
        <p className="text-lg max-w-2xl mb-8 text-gray-400">
          Nexa is the next-generation platform that simplifies your workflow,
          connects your team, and helps you focus on what truly matters.
        </p>
        <NavLink
          to="/register"
          className="px-6 font-semibold py-3 bg-white text-black rounded-lg shadow hover:bg-gray-200"
        >
          Get Started
        </NavLink>
        <div className="mt-12 w-full md:w-3/4 h-64 bg-gray-800 rounded-xl" />
      </section>

      {/* Features, Testimonials, CTA, Footer… keep as-is */}
    </>
  );
};

export default Home;
