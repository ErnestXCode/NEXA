// src/pages/auth/Register.jsx
import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  name: "",
  email: "",
  school: "",
  phoneNumber: "", // <-- added phoneNumber
  password: "",
  confirmPass: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ loading: false, message: "", type: "" });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isMatching = formData.password && formData.password === formData.confirmPass;
  const canRegister =
    Object.values(formData).every((val) => val.trim() !== "") && isMatching;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", type: "" });

    try {
      const { confirmPass, ...payload } = formData;

      const res = await axios.post(`${apiBaseUrl}/api/auth/register`, payload, {
        withCredentials: true,
      });

      dispatch(setCredentials(res.data));
      setStatus({ loading: false, message: "✅ Account created!", type: "success" });

      setTimeout(() => navigate("/dashboard/setup"), 1000);
    } catch (err) {
      setStatus({
        loading: false,
        message: `❌ ${err.response?.data?.msg || "Something went wrong"}`,
        type: "error",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        className="flex flex-col gap-3 bg-gray-950 p-6 w-[400px] sm:w-[450px] rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-white text-xl font-bold mb-2 text-center">
          Create an Account
        </h2>

       {["name", "email", "school", "phoneNumber"].map((field) => (
  <div key={field} className="flex flex-col">
    <label htmlFor={field} className="text-gray-300 font-medium">
      {field === "phoneNumber"
        ? "Phone Number"
        : field.charAt(0).toUpperCase() + field.slice(1)}
    </label>
    <input
      type={field === "email" ? "email" : field === "phoneNumber" ? "tel" : "text"}
      id={field}
      name={field}
      value={formData[field]}
      onChange={handleChange}
      className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
      placeholder={
        field === "phoneNumber" ? "Enter phone e.g. 0789383985" : `Enter ${field}`
      }
      {...(field === "phoneNumber"
        ? {
            pattern: "^(07\\d{8}|01\\d{8})$",
            maxLength: 10,
            required: true,
          }
        : {})}
    />
  </div>
))}


        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-gray-300 font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col">
          <label htmlFor="confirmPass" className="text-gray-300 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPass"
            name="confirmPass"
            value={formData.confirmPass}
            onChange={handleChange}
            className={`p-2 rounded-md focus:ring-2 ${
              !formData.confirmPass
                ? "bg-gray-800 text-white"
                : isMatching
                ? "bg-green-700 text-white focus:ring-green-400"
                : "bg-red-700 text-white focus:ring-red-400"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={!canRegister || status.loading}
          className={`p-2 font-semibold rounded-md transition-all ${
            canRegister
              ? "bg-gray-100 text-black hover:scale-95"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
        >
          {status.loading ? "Registering..." : "Register"}
        </button>

        {status.message && (
          <p
            className={`mt-2 text-center font-semibold ${
              status.type === "success" ? "text-green-400" : "text-red-500"
            }`}
          >
            {status.message}
          </p>
        )}

        {/* Already have an account */}
        <p className="mt-3 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
