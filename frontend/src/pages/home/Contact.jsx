import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const nameRef = useRef();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const [inputData, setInputData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputData.email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    setSending(true);

    emailjs
      .send(
        "service_mvnuvug", // ✅ replace with your Service ID
        "template_6ns9b4j", // ✅ replace with your Template ID
        {
          from_name: inputData.name,
          reply_to: inputData.email,
          message: inputData.message,
        },
        "f2ZFzPg9nvkUFnjIX" // ✅ replace with your Public Key
      )
      .then(() => {
        alert("Message sent successfully!");
        setInputData({ name: "", email: "", message: "" });
        navigate("/");
      })
      .catch((error) => {
        console.error("Failed to send message:", error);
        alert("Something went wrong. Try again.");
      })
      .finally(() => setSending(false));
  };

  // useEffect(() => {
  //   nameRef.current?.focus();
  // }, []);
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
        <div className="max-w-lg mx-auto p-6 bg-gray-950 text-gray-200 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              ref={nameRef}
              name="name"
              type="text"
              placeholder="Your Name"
              required
              value={inputData.name}
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
            />

            <input
              name="email"
              type="email"
              placeholder="Your Email"
              required
              value={inputData.email}
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              required
              value={inputData.message}
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition"
            />

            <button
              type="submit"
              disabled={sending}
              className={`p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition ${
                sending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer (same as others) */}
      <footer className="py-8 bg-gray-900 text-gray-500 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Contact;
