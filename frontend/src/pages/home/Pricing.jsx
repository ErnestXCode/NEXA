import React from "react";
import { NavLink, Link } from "react-router-dom";

const Pricing = () => {
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
          <h1 className="text-5xl font-bold text-white mb-4">Pricing</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Simple, transparent pricing designed for schools of all sizes.
          </p>

          {/* Mobile Links Row */}
          <div className="flex flex-row gap-4 mt-6 md:hidden justify-center px-4">
            <NavLink to="/" className="text-white hover:text-gray-300 text-sm px-2">Home</NavLink>
            <NavLink to="/features" className="text-white hover:text-gray-300 text-sm px-2">Features</NavLink>
            <NavLink to="/pricing" className="text-white hover:text-gray-300 text-sm px-2">Pricing</NavLink>
            <NavLink to="/contact" className="text-white hover:text-gray-300 text-sm px-2">Contact</NavLink>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
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
              className={`p-8 rounded-xl border ${
                p.highlight
                  ? "bg-gray-900 border-gray-700 shadow-lg"
                  : "bg-black border-gray-800"
              }`}
            >
              <h3 className="text-2xl font-semibold text-white mb-4">{p.plan}</h3>
              <p className="text-4xl font-bold text-white mb-6">{p.price}</p>
              <ul className="space-y-3 text-gray-400 mb-6">
                {p.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>
              <button className="w-full px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200">
                Get Started
              </button>
            </div>
          ))}
        </section>
      </main>
    </>
  );
};

export default Pricing;
