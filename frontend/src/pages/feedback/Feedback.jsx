import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const Feedback = () => {
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
        "service_mvnuvug",
        "template_6ns9b4j",
        {
          from_name: inputData.name,
          reply_to: inputData.email,
          message: inputData.message,
        },
        "f2ZFzPg9nvkUFnjIX"
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

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="w-full max-w-lg p-8 md:p-10 rounded-3xl bg-gray-900/70 backdrop-blur-md border border-gray-700 shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
          Send Us Feedback
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          {/* Name */}
          <input
            ref={nameRef}
            name="name"
            type="text"
            placeholder="Your Name"
            required
            value={inputData.name}
            onChange={handleChange}
            className="p-4 md:p-5 rounded-2xl bg-gray-800/80 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition placeholder-gray-400 text-white shadow-sm"
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            required
            value={inputData.email}
            onChange={handleChange}
            className="p-4 md:p-5 rounded-2xl bg-gray-800/80 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition placeholder-gray-400 text-white shadow-sm"
          />

          {/* Message */}
          <textarea
            name="message"
            placeholder="Your Message"
            rows="6"
            required
            value={inputData.message}
            onChange={handleChange}
            className="p-4 md:p-5 rounded-2xl bg-gray-800/80 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition placeholder-gray-400 text-white resize-none shadow-sm"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending}
            className={`p-4 md:p-5 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105 ${
              sending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
