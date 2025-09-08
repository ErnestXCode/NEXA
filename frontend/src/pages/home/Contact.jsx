import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Feedback from "../feedback/Feedback";

const Contact = () => {
  return (
    <>
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-900">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Nexa</h1>
        </div>
        <ul className="hidden md:flex gap-6 text-gray-300">
          <NavLink to="/" className="hover:text-white">
            Home
          </NavLink>
          <NavLink to="/features" className="hover:text-white">
            Features
          </NavLink>
          <NavLink to="/pricing" className="hover:text-white">
            Pricing
          </NavLink>
          <NavLink to="/contact" className="hover:text-white">
            Contact
          </NavLink>
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
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have questions? We’d love to hear from you.
          </p>

          {/* Mobile Links Row */}
          <div className="flex flex-row gap-4 mt-6 md:hidden justify-center px-4">
            <NavLink
              to="/"
              className="text-white hover:text-gray-300 text-sm px-2"
            >
              Home
            </NavLink>
            <NavLink
              to="/features"
              className="text-white hover:text-gray-300 text-sm px-2"
            >
              Features
            </NavLink>
            <NavLink
              to="/pricing"
              className="text-white hover:text-gray-300 text-sm px-2"
            >
              Pricing
            </NavLink>
            <NavLink
              to="/contact"
              className="text-white hover:text-gray-300 text-sm px-2"
            >
              Contact
            </NavLink>
          </div>
        </section>

        {/* Contact Form */}
        <Feedback />
      </main>
    </>
  );
};

export default Contact;
