import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { logOut, selectCurrentUser } from "../../redux/slices/authSlice";
import { store } from "../../redux/store";
import api from "../../api/axios";
import Dashboard from "./Dashboard";

const Home = () => {
  const [sidenav, setSidenav] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  const handleCloseSidenav = () => {
    setSidenav(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      store.dispatch(logOut());
    } catch (err) {
      console.error("Logout failed:", err);
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
                    <NavLink onClick={() => setSidenav(false)} to="/dashboard">
                      Dashboard
                    </NavLink>
                    <NavLink onClick={() => setSidenav(false)} to="/fees">
                      Fees
                    </NavLink>
                    <NavLink onClick={() => setSidenav(false)} to="/exams">
                      Exams
                    </NavLink>
                    <NavLink onClick={() => setSidenav(false)} to="/attendance">
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
            <nav>
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
            </nav>
            
          </>
        )}
      </section>
    </nav>
    <main>
      {'some stories and stuff'}
    </main>
        </>
  );
};

export default Home;

// * **Sidebar:**

//   * Dashboard (home icon)
//   * Fees (money icon)
//   * Exams (book icon)
//   * Attendance (clipboard icon)
//   * Communication (chat icon)
//   * Settings (gear icon) → School setup, classes, users
