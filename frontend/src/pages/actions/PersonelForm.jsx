import React, { useState } from "react";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";

const registerObj = {
  role: "",
  name: "",
  email: "",
  password: "",
  confirmPass: "",
};

const PersonelForm = () => {
  const [registerDetails, setRegisterDetails] = useState(registerObj);
  const [canRegister, setCanRegister] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const updatedDetails = {
      ...registerDetails,
      [e.target.name]: e.target.value,
    };
    setRegisterDetails(updatedDetails);

    setIsMatching(updatedDetails.confirmPass && updatedDetails.confirmPass === updatedDetails.password);

    setCanRegister(
      updatedDetails.role &&
      updatedDetails.name &&
      updatedDetails.email &&
      updatedDetails.password &&
      updatedDetails.confirmPass === updatedDetails.password
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { confirmPass, ...dataToSend } = registerDetails;
      await api.post("/auth/registerpersonel", dataToSend, { withCredentials: true });
      setMessage("✅ Account created successfully!");
      setRegisterDetails(registerObj);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <>
      <main className="p-6 bg-gray-950 min-h-screen flex justify-center items-start">
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg w-[500px] flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white">Add Personel</h1>

          <label>Role</label>
          <select
            name="role"
            value={registerDetails.role}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="" disabled>Select role</option>
            <option value="teacher">Teacher</option>
            <option value="bursar">Bursar</option>
          </select>

          <label>Name</label>
          <input
            name="name"
            value={registerDetails.name}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />

          <label>Email</label>
          <input
            name="email"
            value={registerDetails.email}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={registerDetails.password}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPass"
            value={registerDetails.confirmPass}
            onChange={handleChange}
            className={`p-2 rounded ${
              registerDetails.confirmPass === ""
                ? "bg-gray-800 text-white"
                : isMatching
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          />

          <button
            type="submit"
            disabled={!canRegister}
            className={`py-2 rounded font-semibold ${canRegister ? "bg-white text-black hover:bg-gray-200" : "bg-gray-500 cursor-not-allowed"}`}
          >
            Add Personel
          </button>

          {message && <p className={`${message.startsWith("✅") ? "text-green-400" : "text-red-500"} mt-2`}>{message}</p>}
        </form>
      </main>
    </>
  );
};

export default PersonelForm;
