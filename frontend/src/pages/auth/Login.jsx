import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;

const loginObj = {
  email: "",
  password: "",
};

const Login = () => {
  const [loginDetails, setLoginDetails] = useState(loginObj);
  const [canLogin, setCanLogin] = useState(false);
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    type: "",
  });

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

      setTimeout(() => navigate("/dashboard"), 800);
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
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-gray-950 p-6 w-[450px] rounded-lg shadow-lg"
      >
        <h2 className="text-white text-xl font-bold mb-2 text-center">
          Welcome Back
        </h2>

        {/* Email */}
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

        {/* Password */}
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

        {/* Button */}
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

        {/* Status */}
        {status.message && (
          <p
            className={`mt-2 text-center font-semibold ${
              status.type === "success" ? "text-green-400" : "text-red-500"
            }`}
          >
            {status.message}
          </p>
        )}

        {/* Link */}
        <p className="text-gray-400 text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
