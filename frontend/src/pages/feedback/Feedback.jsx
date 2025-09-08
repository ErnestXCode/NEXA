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
    <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="name" className="mb-1 font-medium">
          Name
        </label>
        <input
          ref={nameRef}
          name="name"
          type="text"
          id="name"
          required
          value={inputData.name}
          onChange={handleChange}
          className="mb-4 p-2 rounded-lg bg-gray-700 border border-blue-600 focus:outline-none"
        />

        <label htmlFor="email" className="mb-1 font-medium">
          Email
        </label>
        <input
          name="email"
          type="email"
          id="email"
          required
          value={inputData.email}
          onChange={handleChange}
          className="mb-4 p-2 rounded-lg bg-gray-700 border border-blue-600 focus:outline-none"
        />

        <label htmlFor="message" className="mb-1 font-medium">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          rows="5"
          required
          value={inputData.message}
          onChange={handleChange}
          className="mb-4 p-2 rounded-lg bg-gray-700 border border-blue-600 focus:outline-none"
        />

        <button
          type="submit"
          disabled={sending}
          className={`p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition ${
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
