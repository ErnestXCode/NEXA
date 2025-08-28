import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { useQuery } from "@tanstack/react-query";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;

const registerObj = {
  name: "",
  email: "",
  school: "",
  password: "",
  confirmPass: "",
};

const Register = () => {
  const [registerDetails, setRegisterDetails] = useState(registerObj);
  const [canRegister, setCanRegister] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleChange = (e) => {
    const updatedDetails = {
      ...registerDetails,
      [e.target.name]: e.target.value,
    };

    setRegisterDetails(updatedDetails);

    if (
      updatedDetails.confirmPass !== "" &&
      updatedDetails.confirmPass === updatedDetails.password
    ) {
      setIsMatching(true);
    } else {
      setIsMatching(false);
    }

    if (
      updatedDetails.confirmPass !== "" &&
      updatedDetails.confirmPass === updatedDetails.password &&
      Object.values(updatedDetails).every((val) => val !== "")
    ) {
      setCanRegister(true);
    } else {
      setCanRegister(false);
    }
  };

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { confirmPass, ...dataToSend } = registerDetails;
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/register`,
        dataToSend,
        { withCredentials: true }
      );

      setMessage("✅ Account created successfully!");
      // maybe redirect after a short timeout
      console.log(response);
      dispatch(setCredentials(response.data));
      navigate("/");
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <form
      className="flex flex-col bg-gray-950 p-3 w-[500px]"
      onSubmit={handleSubmit}
    >
      
      <label htmlFor="name">Name</label>
      <input
        className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
        type="text"
        onChange={handleChange}
        value={registerDetails.name}
        name="name"
        id="name"
      />

      <label htmlFor="email">Email</label>
      <input
        className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
        type="email"
        id="email"
        onChange={handleChange}
        value={registerDetails.email}
        name="email"
      />

      <label htmlFor="school">School</label>

        <input
          type="text"
          id="school"
          name="school"
          value={registerDetails.school}
          onChange={handleChange}
          className="bg-amber-50 hover:bg-gray-900 hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
          placeholder="Enter new school name"
        />

      <label htmlFor="password">Password</label>
      <input
        className="bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2"
        type="password"
        onChange={handleChange}
        value={registerDetails.password}
        name="password"
        id="password"
      />

      <label htmlFor="">Confirm Password</label>
      <input
        className={`bg-amber-50 hover:bg-gray-900  hover:text-white mb-3 mt-1 text-black p-1 font-semibold pl-2 ${
          registerDetails.confirmPass == ""
            ? ""
            : isMatching
            ? "bg-green-400 hover:bg-green-400 text-white"
            : "bg-red-600 hover:bg-red-600 text-white"
        }`}
        type="password"
        onChange={handleChange}
        value={registerDetails.confirmPass}
        name="confirmPass"
        id="confirmPass"
      />

      <button
        className={`bg-gray-50 w-fit ml-auto mr-auto text-black font-semibold p-1 mt-1 pl-2 pr-2 disabled:bg-gray-500 ${
          canRegister && "hover:scale-95 hover:cursor-pointer"
        }`}
        disabled={!canRegister}
      >
        Register
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

export default Register;
