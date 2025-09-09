import React from "react";
import { Link, NavLink } from "react-router-dom";

const Home = () => {
  return (
    <>
      {/* Navbar */}
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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 bg-gradient-to-b from-gray-950 to-gray-900 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
          Welcome to Nexa
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-10 text-gray-400">
          Nexa is the next-generation platform that simplifies your workflow,
          connects your team, and helps you focus on what truly matters.
        </p>
        <Link
          to="/register"
          className="px-8 py-3 bg-white text-black font-semibold rounded-xl shadow hover:bg-gray-200 transition-transform transform hover:scale-105"
        >
          Get Started
        </Link>

        {/* Mobile Links */}
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

        <div className="mt-14 w-full md:w-3/4 h-72 bg-gray-800 rounded-2xl shadow-inner" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-950 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-14 text-white">
            Why Choose Nexa?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Easy to Use", text: "An intuitive interface designed to make your experience seamless and enjoyable." },
              { title: "Powerful Tools", text: "Packed with features that empower you to get more done with fewer clicks." },
              { title: "Secure & Reliable", text: "Built with security in mind, ensuring your data is always safe and accessible." }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-gray-900 rounded-2xl shadow border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-700 rounded-full" />
                <h3 className="font-semibold text-xl mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-14 text-white">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { text: "Nexa completely changed how our team collaborates. Highly recommend!", name: "Alex Johnson" },
              { text: "The tools are simple yet powerful. We can’t imagine working without Nexa.", name: "Sarah Lee" }
            ].map((t, i) => (
              <div key={i} className="p-8 border border-gray-800 rounded-2xl shadow bg-gray-950 hover:border-gray-700 transition-colors">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-5" />
                <p className="italic mb-3 text-gray-300">“{t.text}”</p>
                <p className="font-semibold text-white">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-950 text-white text-center px-6">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">Ready to get started?</h2>
        <p className="mb-10 text-gray-400">
          Join the growing community of schools using Nexa.
        </p>
        <Link
          to="/register"
          className="px-8 py-3 bg-white text-black font-semibold rounded-xl shadow hover:bg-gray-200 transition-transform transform hover:scale-105"
        >
          Create Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-500 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;
