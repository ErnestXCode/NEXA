import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;

const loginObj = { email: "", password: "" };

const Login = () => {
  const [loginDetails, setLoginDetails] = useState(loginObj);
  const [canLogin, setCanLogin] = useState(false);
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    type: "",
  });

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ message: "", type: "" });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const updatedDetails = { ...loginDetails, [e.target.name]: e.target.value };
    setLoginDetails(updatedDetails);
    setCanLogin(
      Object.values(updatedDetails).every((val) => val.trim() !== "")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", type: "" });

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/login`,
        loginDetails,
        { withCredentials: true }
      );
      dispatch(setCredentials(response.data));
      setStatus({
        loading: false,
        message: "✅ Logged in successfully!",
        type: "success",
      });
      setTimeout(() => navigate("/dashboard",  {replace: true}), 800);
    } catch (err) {
      setStatus({
        loading: false,
        message: `❌ ${err.response?.data?.msg || "Something went wrong"}`,
        type: "error",
      });
    }
  };

  // Step 1: Request password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus({ message: "", type: "" });

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/forgot-password`,
        { email: forgotEmail }
      );

      // Store token internally (hidden from user) to show reset form
      setResetToken(response.data.token);
      setForgotStatus({
        message: "✅ Email verified! Enter your new password below.",
        type: "success",
      });
    } catch (err) {
      setForgotStatus({
        message: `❌ ${err.response?.data?.msg || "Error processing request"}`,
        type: "error",
      });
    }
  };

  // Step 2: Reset password using stored token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotStatus({ message: "", type: "" });

    if (!newPassword || !resetToken) {
      setForgotStatus({
        message: "❌ New password is required",
        type: "error",
      });
      return;
    }

    try {
      await axios.post(`${apiBaseUrl}/api/auth/reset-password`, {
        token: resetToken,
        password: newPassword,
      });
      setForgotStatus({
        message: "✅ Password reset successful!",
        type: "success",
      });
      setForgotEmail("");
      setNewPassword("");
      setResetToken(null);
      setForgotModalOpen(false); // close the modal
    } catch (err) {
      setForgotStatus({
        message: `❌ ${err.response?.data?.msg || "Error resetting password"}`,
        type: "error",
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
          Welcome Back
        </h2>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-gray-300 font-medium">
            Email
          </label>
          <input
            className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
            type="email"
            id="email"
            name="email"
            value={loginDetails.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="text-gray-300 font-medium">
            Password
          </label>
          <input
            className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
            type="password"
            id="password"
            name="password"
            value={loginDetails.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={!canLogin || status.loading}
          className={`p-2 font-semibold rounded-md transition-all ${
            canLogin
              ? "bg-gray-100 text-black hover:scale-95"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
        >
          {status.loading ? "Logging in..." : "Login"}
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

        <div className="flex justify-between mt-2">
          <p className="text-gray-400 text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setForgotModalOpen(true)}
            className="text-blue-400 hover:underline text-sm"
          >
            Forgot Password?
          </button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-950 p-6 rounded-xl w-[400px] shadow-lg relative">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-2 right-3 text-white text-xl font-bold"
            >
              ×
            </button>
            <h3 className="text-white text-lg font-semibold mb-4">
              Reset Password
            </h3>

            {/* Step 1: Request Token */}
            {!resetToken && (
              <form
                onSubmit={handleForgotPassword}
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded-md hover:scale-95 transition"
                >
                  Submit
                </button>
              </form>
            )}

            {/* Step 2: Reset Password */}
            {resetToken && (
              <form
                onSubmit={handleResetPassword}
                className="flex flex-col gap-3"
              >
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-800 text-white p-2 rounded-md focus:ring-2 focus:ring-gray-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded-md hover:scale-95 transition"
                >
                  Reset Password
                </button>
              </form>
            )}

            {forgotStatus.message && (
              <p
                className={`mt-2 text-center font-semibold ${
                  forgotStatus.type === "success"
                    ? "text-green-400"
                    : "text-red-500"
                }`}
              >
                {forgotStatus.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
