import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";


const registerObj = {
  name: "",
  email: "",
  password: "",
  confirmPass: "",
};



const PersonelForm = () => {
  
  const [registerDetails, setRegisterDetails] = useState(registerObj);
  const [canRegister, setCanRegister] = useState(false);
  const [isMatching, setIsMatching] = useState(false);


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
      const response = await api.post(`/auth/registerpersonel`, dataToSend, {
        withCredentials: true,
      });

      setMessage("✅ Account created successfully!");
      // maybe redirect after a short timeout
      // console.log(response);
      // dispatch(setCredentials(response.data));
      // its replacing admin stuff with those personel bad thing'
      // setRegisterDetails(registerObj)
      
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.msg || "Something went wrong"}`);
    }
  };

  return (
    <>
      <main>
        <form
          className="flex flex-col bg-gray-950 p-3 w-[500px]"
          onSubmit={handleSubmit}
        >
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            onChange={handleChange}
            value={registerDetails.role}
            className="bg- mb-3 mt-1 px-3 py-2 border border-gray-300 rounded appearance-none"
            defaultValue="" // Optional: empty default
          >
            <option className="bg-black" value="" disabled>
              Select role
            </option>
            <option className="bg-black" value="teacher">
              Teacher
            </option>
            <option className="bg-black" value="bursar">
              Bursar
            </option>
          </select>
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
            Add personel
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
      </main>
    </>
  );
};

export default PersonelForm;
