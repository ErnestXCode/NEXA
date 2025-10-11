// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ message: "", type: "", loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus({ message: "Passwords do not match", type: "error" });
      return;
    }

    setStatus({ message: "", type: "", loading: true });

    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/reset-password`, {
        token,
        password,
      });

      setStatus({ message: response.data.msg, type: "success", loading: false });

      // Redirect to login after short delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus({
        message: err.response?.data?.msg || "Something went wrong",
        type: "error",
        loading: false,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-gray-950 p-6 w-[450px] rounded-lg shadow-lg"
      >
        <h2 className="text-white text-xl font-bold mb-2 text-center">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
          required
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
          required
        />

        <button
          type="submit"
          disabled={status.loading}
          className={`p-2 font-semibold rounded-md transition-all ${
            status.loading
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:scale-95"
          }`}
        >
          {status.loading ? "Resetting..." : "Reset Password"}
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

        <p className="text-gray-400 text-sm text-center mt-3">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
