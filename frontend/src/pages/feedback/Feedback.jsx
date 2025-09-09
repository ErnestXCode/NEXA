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

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return (
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
  );
};

export default Feedback;
