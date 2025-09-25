import React from "react";
import { NavLink, Link } from "react-router-dom";
import api from "../../api/axios";


const plans = [
  {
    plan: "Starter",
    price: 20000,
    pesapalAvailable: true,
    features: [
      "Up to 100 students",
      "Basic exam reports",
      "Attendance tracking",
      "Email support",
    ],
  },
  {
    plan: "Professional",
    price: 50000,
    pesapalAvailable: false,
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
    price: 0,
    pesapalAvailable: false,
    features: [
      "Unlimited students",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

const Pricing = ({ schoolId }) => {
  const handlePayment = async (plan, amount) => {
    if (!schoolId) return alert("School ID is missing!");

    try {
      const res = await api.post(
        "/pesapal/create-payment",

        { schoolId, plan, amount }
      );

      const data = res.data;
      console.log(res.data)
      if (data.paymentUrl) window.open(data.paymentUrl, "_blank");
      else alert("Payment link generation failed");
    } catch (err) {
      console.error(err);
      alert("Error creating payment");
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-950 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Nexa</h1>
        <ul className="hidden md:flex gap-8 text-gray-400">
          <NavLink to="/" className="hover:text-white transition-colors">
            Home
          </NavLink>
          <NavLink
            to="/features"
            className="hover:text-white transition-colors"
          >
            Features
          </NavLink>
          <NavLink to="/pricing" className="hover:text-white transition-colors">
            Pricing
          </NavLink>
          <NavLink to="/contact" className="hover:text-white transition-colors">
            Contact
          </NavLink>
        </ul>
        <Link
          to="/register"
          className="px-5 py-2 bg-white font-semibold text-black rounded-xl hover:bg-gray-200 transition-colors"
        >
          Sign Up
        </Link>
      </nav>

      {/* Main */}
      <main className="min-h-screen bg-gray-950 text-gray-100">
        {/* Header */}
        <section className="py-24 text-center bg-gradient-to-b from-gray-950 to-gray-900 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Pricing
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Simple, transparent pricing designed for schools of all sizes.
          </p>
          {/* Mobile Links */}
          <div className="flex flex-row gap-6 mt-8 md:hidden justify-center">
            <NavLink to="/" className="text-gray-300 hover:text-white text-sm">
              Home
            </NavLink>
            <NavLink
              to="/features"
              className="text-gray-300 hover:text-white text-sm"
            >
              Features
            </NavLink>
            <NavLink
              to="/pricing"
              className="text-gray-300 hover:text-white text-sm"
            >
              Pricing
            </NavLink>
            <NavLink
              to="/contact"
              className="text-gray-300 hover:text-white text-sm"
            >
              Contact
            </NavLink>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border shadow transition-transform transform hover:scale-105 ${
                p.highlight
                  ? "bg-gray-900 border-gray-700 shadow-lg"
                  : "bg-gray-900 border-gray-800"
              }`}
            >
              <h3 className="text-2xl font-semibold text-white mb-4">
                {p.plan}
              </h3>
              <p className="text-4xl font-bold text-white mb-6">
                {p.price > 0 ? `KES ${p.price}` : "Custom"}
              </p>
              <ul className="space-y-3 text-gray-400 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              {p.pesapalAvailable ? (
                <button
                  onClick={() => handlePayment(p.plan, p.price)}
                  className="w-full px-5 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Get Started
                </button>
              ) : (
                <button
                  disabled
                  className="w-full px-5 py-2 bg-gray-700 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-500 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Pricing;
