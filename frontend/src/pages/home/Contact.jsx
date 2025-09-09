import React from "react";
import { NavLink, Link } from "react-router-dom";
import Feedback from "../feedback/Feedback";

const Contact = () => {
  return (
    <>
      {/* Navbar (same as Home/Features/Pricing) */}
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
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions? We’d love to hear from you.
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

        {/* Contact Form Section */}
        <section className="py-24 max-w-3xl mx-auto px-6">
          <div className="p-8 bg-gray-900 rounded-2xl shadow border border-gray-800 hover:border-gray-700 transition-colors">
            <Feedback />
          </div>
        </section>
      </main>

      {/* Footer (same as others) */}
      <footer className="py-8 bg-gray-900 text-gray-500 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Contact;
