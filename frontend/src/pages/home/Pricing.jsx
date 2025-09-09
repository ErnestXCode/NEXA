import React from "react";
import { NavLink, Link } from "react-router-dom";

const Pricing = () => {
  return (
    <>
      {/* Navbar (same as Home/Features) */}
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
            Pricing
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Simple, transparent pricing designed for schools of all sizes.
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

        {/* Pricing Plans */}
        <section className="py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
          {[
            {
              plan: "Starter",
              price: "$19/mo",
              features: [
                "Up to 100 students",
                "Basic exam reports",
                "Attendance tracking",
                "Email support",
              ],
            },
            {
              plan: "Professional",
              price: "$49/mo",
              features: [
                "Up to 500 students",
                "Detailed reports",
                "Fees management",
                "Priority support",
              ],
              highlight: true,
            },
            {
              plan: "Enterprise",
              price: "Custom",
              features: [
                "Unlimited students",
                "Advanced analytics",
                "Dedicated account manager",
                "Custom integrations",
              ],
            },
          ].map((p, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border shadow transition-transform transform hover:scale-105 ${
                p.highlight
                  ? "bg-gray-900 border-gray-700 shadow-lg"
                  : "bg-gray-900 border-gray-800"
              }`}
            >
              <h3 className="text-2xl font-semibold text-white mb-4">{p.plan}</h3>
              <p className="text-4xl font-bold text-white mb-6">{p.price}</p>
              <ul className="space-y-3 text-gray-400 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full px-5 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                Get Started
              </button>
            </div>
          ))}
        </section>
      </main>

      {/* Footer (same as Home/Features) */}
      <footer className="py-8 bg-gray-900 text-gray-500 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Pricing;
