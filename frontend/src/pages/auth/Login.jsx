import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const updatedDetails = {
      ...loginDetails,
      [e.target.name]: e.target.value,
    };

    setLoginDetails(updatedDetails);

    if (Object.values(updatedDetails).every((val) => val !== "")) {
      setCanLogin(true);
    } else {
      setCanLogin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/login`,
        loginDetails,
        { withCredentials: true }
      );

      setMessage("✅ Account created successfully!");
      // maybe redirect after a short timeout
     
      dispatch(setCredentials(response.data));
      navigate("/dashboard");
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <form
      className="flex flex-col bg-gray-950 p-3 w-[500px]"
      onSubmit={handleSubmit}
    >
      <label htmlFor="email">Email</label>
      <input
        className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
        type="email"
        id="email"
        onChange={handleChange}
        value={loginDetails.email}
        name="email"
      />

      <label htmlFor="password">Password</label>
      <input
        className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
        type="password"
        onChange={handleChange}
        value={loginDetails.password}
        name="password"
        id="password"
      />

      <button
        className={`bg-gray-50 w-fit ml-auto mr-auto text-black font-semibold p-1 mt-1 pl-2 pr-2 disabled:bg-gray-500 ${
          canLogin && "hover:scale-95 hover:cursor-pointer"
        }`}
        disabled={!canLogin}
      >
        Login
      </button>
      {message && (
        <p
          className={`mt-3 text-center font-semibold ${
            message.startsWith("✅") ? "text-green-400" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

export default Login;
