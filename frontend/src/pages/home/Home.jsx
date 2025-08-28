import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  logOut,
  selectCurrentUser,
  setCredentials,
} from "../../redux/slices/authSlice";
import { store } from "../../redux/store";
import api from "../../api/axios";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;

const registerObj = {
  name: "",
  email: "",
  password: "",
  confirmPass: "",
};

const Home = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [sidenav, setSidenav] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      store.dispatch(logOut());
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCloseSidenav = () => {
    setSidenav(false);
  };

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
      const response = await api.post(
        `/auth/registerpersonel`,
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
    <>
      <nav className="p-4 flex gap-4 justify-between items-center pr-10 bg-gray-900">
        <h1 className="font-semibold">
          <Link to="/" className="cursor-pointer">
            NEXA
          </Link>
        </h1>
        <section className="flex  gap-2 items-center">
          {currentUser ? (
            <>
              <div className="size-10 bg-black rounded-full flex items-center justify-center font-semibold">
                {currentUser?.name[0]}
              </div>
              <section onClick={() => setSidenav(true)}>Sidenav</section>
              {sidenav ? (
                <>
                  <section className="bg-gray-950 fixed right-0 w-90 top-0 h-screen p-5">
                    <section className="flex justify-between ">
                      <button
                        className="bg-gray-100 cursor-pointer text-black rounded-2xl p-2 font-semibold hover:bg-black hover:text-white"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>

                      <button onClick={handleCloseSidenav}>X</button>
                    </section>

                    <section className="flex flex-col bg-gray-900 p-2 mt-5 rounded-2xl gap-4">
                      <NavLink onClick={() => setSidenav(false)} to="/">
                        Dashboard
                      </NavLink>
                      <NavLink onClick={() => setSidenav(false)} to="/fees">
                        Fees
                      </NavLink>
                      <NavLink onClick={() => setSidenav(false)} to="/exams">
                        Exams
                      </NavLink>
                      <NavLink
                        onClick={() => setSidenav(false)}
                        to="/attendance"
                      >
                        Attendance
                      </NavLink>
                      <NavLink
                        onClick={() => setSidenav(false)}
                        to="/communication"
                      >
                        Communication
                      </NavLink>
                      <NavLink onClick={() => setSidenav(false)} to="/settings">
                        Settings
                      </NavLink>
                    </section>
                  </section>
                </>
              ) : (
                ""
              )}
            </>
          ) : (
            <>
              <Link
                className="bg-gray-100 cursor-pointer text-black rounded-2xl p-2 font-semibold hover:bg-black hover:text-white"
                to="/register"
              >
                Register
              </Link>
              <Link
                className="bg-gray-100 cursor-pointer text-black rounded-2xl p-2 font-semibold hover:bg-black hover:text-white"
                to="/login"
              >
                Login
              </Link>
            </>
          )}
        </section>
      </nav>
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

// * **Sidebar:**

//   * Dashboard (home icon)
//   * Fees (money icon)
//   * Exams (book icon)
//   * Attendance (clipboard icon)
//   * Communication (chat icon)
//   * Settings (gear icon) → School setup, classes, users

export default Home;
