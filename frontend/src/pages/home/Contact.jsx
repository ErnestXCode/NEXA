// src/pages/landing/Contact.jsx
import React, { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! (backend not yet connected)");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <section className="py-20 text-center bg-gray-900">
        <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Have questions? We’d love to hear from you.
        </p>
      </section>

      {/* Contact Form */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-gray-900 rounded-xl shadow border border-gray-800"
        >
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-gray-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-gray-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-gray-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow hover:bg-gray-200"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
