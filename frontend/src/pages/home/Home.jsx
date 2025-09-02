import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { logOut, selectCurrentUser } from "../../redux/slices/authSlice";
import { store } from "../../redux/store";
import api from "../../api/axios";
import Dashboard from "./Dashboard";

const Home = () => {
  const [sidenav, setSidenav] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  const handleCloseSidenav = () => {
    setSidenav(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      store.dispatch(logOut());
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <main>
        <div className="min-h-screen bg-black text-gray-100">
          {/* Navbar */}
          <nav className="flex justify-between items-center px-8 py-4 bg-gray-900">
            <h1 className="text-2xl font-bold">Nexa</h1>
            <ul className="flex gap-6 text-gray-300">
              <NavLink to='/' className="hover:text-white cursor-pointer">Home</NavLink>
              <NavLink to='/features' className="hover:text-white cursor-pointer">Features</NavLink>
              <NavLink to='/pricing' className="hover:text-white cursor-pointer">Pricing</NavLink>
              <NavLink to='/contact' className="hover:text-white cursor-pointer">Contact</NavLink>
            </ul>

            <Link
              to="/register"
              className="px-4 py-2 bg-white font-semibold text-black rounded-lg hover:bg-gray-200"
            >
              Sign Up
            </Link>
          </nav>

          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center py-20 bg-black">
            <h1 className="text-5xl font-bold mb-4 text-white">
              Welcome to Nexa
            </h1>
            <p className="text-lg max-w-2xl mb-8 text-gray-400">
              Nexa is the next-generation platform that simplifies your
              workflow, connects your team, and helps you focus on what truly
              matters.
            </p>
            <Link
              to="/register"
              className="px-6 font-semibold py-3 bg-white text-black rounded-lg shadow hover:bg-gray-200"
            >
              Get Started
            </Link>

            {/* Fake hero image */}
            <div className="mt-12 w-3/4 h-64 bg-gray-800 rounded-xl"></div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-gray-900">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-12 text-white">
                Why Choose Nexa?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="p-6 bg-black rounded-xl shadow border border-gray-800">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full"></div>
                  <h3 className="font-semibold text-xl mb-2 text-white">
                    Easy to Use
                  </h3>
                  <p className="text-gray-400">
                    An intuitive interface designed to make your experience
                    seamless and enjoyable.
                  </p>
                </div>

                <div className="p-6 bg-black rounded-xl shadow border border-gray-800">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full"></div>
                  <h3 className="font-semibold text-xl mb-2 text-white">
                    Powerful Tools
                  </h3>
                  <p className="text-gray-400">
                    Packed with features that empower you to get more done with
                    fewer clicks.
                  </p>
                </div>

                <div className="p-6 bg-black rounded-xl shadow border border-gray-800">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full"></div>
                  <h3 className="font-semibold text-xl mb-2 text-white">
                    Secure & Reliable
                  </h3>
                  <p className="text-gray-400">
                    Built with security in mind, ensuring your data is always
                    safe and accessible.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 bg-black">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-12 text-white">
                What Our Users Say
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 border border-gray-800 rounded-lg shadow-sm bg-gray-900">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                  <p className="italic mb-2 text-gray-300">
                    “Nexa completely changed how our team collaborates. Highly
                    recommend!”
                  </p>
                  <p className="font-semibold text-white">— Alex Johnson</p>
                </div>

                <div className="p-6 border border-gray-800 rounded-lg shadow-sm bg-gray-900">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                  <p className="italic mb-2 text-gray-300">
                    “The tools are simple yet powerful. We can’t imagine working
                    without Nexa.”
                  </p>
                  <p className="font-semibold text-white">— Sarah Lee</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gray-900 text-white text-center">
            <h2 className="text-3xl font-semibold mb-6">
              Ready to get started?
            </h2>
            <p className="mb-8 text-gray-400">
              Join the growing community of schools using Nexa.
            </p>
            <Link to='/register' className="px-6 py-3 cursor-pointer bg-white text-black font-semibold rounded-lg shadow hover:bg-gray-200">
              Create Account
            </Link>
          </section>

          {/* Footer */}
          <footer className="py-6 bg-black text-gray-500 text-center border-t border-gray-800">
            <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Home;

// * **Sidebar:**

//   * Dashboard (home icon)
//   * Fees (money icon)
//   * Exams (book icon)
//   * Attendance (clipboard icon)
//   * Communication (chat icon)
//   * Settings (gear icon) → School setup, classes, users
